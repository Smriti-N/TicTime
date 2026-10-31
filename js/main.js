// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver) return;

  state.board[index] = state.currentPlayer;
  renderBoard(state.board);

  const result = getGameResult(state.board);

  if (result.status === 'win') {
    state.gameOver = true;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
  } else if (result.status === 'draw') {
    state.gameOver = true;
    setStatus("It's a draw!", '');
    setBoardLocked(true);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }
}

function startNewGame() {
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;
  renderBoard(state.board);
  setBoardLocked(false);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// TODO: wire up the "Reset Scores" button (#reset-scores-btn)

buildBoard(handleCellClick);
renderBoard(state.board);
renderScores(state.scores);
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// PWA Installation & Service Worker Registration
let deferredPrompt = null;
const installBtn = document.getElementById('install-btn');
const installModal = document.getElementById('install-modal');
const installGuideContent = document.getElementById('install-guide-content');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalOkBtn = document.getElementById('modal-ok-btn');
const offlineToast = document.getElementById('offline-toast');

// Hide install button if app is already running in standalone (installed) mode
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (isStandalone && installBtn) {
  installBtn.hidden = true;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn && !isStandalone) {
    installBtn.hidden = false;
  }
});

function showInstallModal(instructions) {
  if (!installModal || !installGuideContent) return;
  installGuideContent.innerHTML = instructions;
  installModal.hidden = false;
}

function hideInstallModal() {
  if (installModal) installModal.hidden = true;
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideInstallModal);
if (modalOkBtn) modalOkBtn.addEventListener('click', hideInstallModal);
if (installModal) {
  installModal.addEventListener('click', (e) => {
    if (e.target === installModal) hideInstallModal();
  });
}

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      installBtn.hidden = true;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome !== 'accepted') {
        installBtn.hidden = false;
      }
      deferredPrompt = null;
    } else {
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isMacSafari = /safari/.test(ua) && !/chrome|chromium|edg/.test(ua) && /macintosh/.test(ua);
      const isFile = window.location.protocol === 'file:';

      if (isFile) {
        showInstallModal(`
          <p><strong>Running directly from file:</strong></p>
          <p>Modern browsers require a local web server to install web apps and activate offline caching.</p>
          <p>Run this command in your terminal inside the <code>TicTime</code> folder:</p>
          <pre><code>python3 -m http.server 8000</code></pre>
          <p>Then open <code>http://localhost:8000</code> to install and play offline!</p>
        `);
      } else if (isMacSafari) {
        showInstallModal(`
          <p>To install TicTime on macOS:</p>
          <ol>
            <li>In Safari's top menu bar, click <strong>File</strong>.</li>
            <li>Select <strong>Add to Dock...</strong></li>
            <li>Click <strong>Add</strong> to launch TicTime as a standalone desktop app.</li>
          </ol>
        `);
      } else if (isIOS) {
        showInstallModal(`
          <p>To install TicTime on iOS:</p>
          <ol>
            <li>Tap the <strong>Share</strong> button ⎋ at the bottom of Safari.</li>
            <li>Scroll down and tap <strong>Add to Home Screen ➕</strong>.</li>
          </ol>
        `);
      } else {
        showInstallModal(`
          <p>To install TicTime:</p>
          <ol>
            <li>Look for the <strong>Install</strong> icon in your browser's address bar (or Menu ⋮ &gt; <em>Install TicTime</em> / <em>Save and share</em>).</li>
            <li>Click <strong>Install</strong> to add it to your system.</li>
          </ol>
        `);
      }
    }
  });
}

window.addEventListener('appinstalled', () => {
  if (installBtn) {
    installBtn.hidden = true;
  }
  deferredPrompt = null;
  console.log('TicTime was successfully installed');
});

// Offline / Online status indicator
function updateOnlineStatus() {
  if (!offlineToast) return;
  if (!navigator.onLine) {
    offlineToast.textContent = '⚡ You are offline · Offline play ready';
    offlineToast.hidden = false;
  } else {
    offlineToast.hidden = true;
  }
}
window.addEventListener('offline', updateOnlineStatus);
window.addEventListener('online', updateOnlineStatus);
updateOnlineStatus();

// Register Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service worker registered successfully:', reg.scope))
      .catch((err) => console.warn('Service worker registration failed:', err));
  }
}

if (document.readyState === 'complete') {
  registerServiceWorker();
} else {
  window.addEventListener('load', registerServiceWorker);
}

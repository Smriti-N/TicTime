// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const PLAYER_PRESETS = {
  2: ['X', 'O'],
  3: ['X', 'O', '△'],
  4: ['X', 'O', '△', '□']
};

const state = {
  size: 3,
  playerCount: 2,
  players: ['X', 'O'],
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  moves: [],
  matchLogs: [],
  elapsedSeconds: 0,
  timerInterval: null
};

// Timer Management
function startTimer() {
  stopTimer();
  state.elapsedSeconds = 0;
  updateTimerDisplay(0);
  state.timerInterval = setInterval(() => {
    state.elapsedSeconds++;
    updateTimerDisplay(state.elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// Cell Click Handler
function handleCellClick(index) {
  // CRITICAL FIX: Prevent overwrite if game is over OR cell is already marked
  if (state.gameOver || state.board[index] !== null) return;

  // Make move
  state.board[index] = state.currentPlayer;
  state.moves.push({ player: state.currentPlayer, index: index });
  renderBoard(state.board);
  renderMoves(state.moves, state.size);

  const result = getGameResult(state.board, state.size);

  if (result.status === 'win') {
    state.gameOver = true;
    stopTimer();
    state.scores[result.winner] = (state.scores[result.winner] || 0) + 1;
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
    setBoardLocked(true);
    renderScoreboard(state.scores, state.players, state.currentPlayer);
    launchConfetti();

    state.matchLogs.push({
      winner: result.winner,
      duration: timerDisplayEl.textContent
    });
    renderMatchLog(state.matchLogs);
  } else if (result.status === 'draw') {
    state.gameOver = true;
    stopTimer();
    // CRITICAL FIX: Increment draw count and update scoreboard
    state.scores.draws++;
    setStatus("It's a draw!", null);
    setBoardLocked(true);
    renderScoreboard(state.scores, state.players, state.currentPlayer);

    state.matchLogs.push({
      winner: null,
      duration: timerDisplayEl.textContent
    });
    renderMatchLog(state.matchLogs);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer, state.players);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
    renderScoreboard(state.scores, state.players, state.currentPlayer);
  }
}

// Hover preview handler (strictly matches active player's mark)
function handleCellHover(index, cellEl) {
  if (state.gameOver || state.board[index] !== null) return;
  const ghost = document.createElement('div');
  ghost.className = 'ghost-mark';
  ghost.innerHTML = getPlayerMarkSVG(state.currentPlayer);
  cellEl.appendChild(ghost);
}

function handleCellLeave(index, cellEl) {
  const ghost = cellEl.querySelector('.ghost-mark');
  if (ghost) ghost.remove();
}

// New Game
function startNewGame() {
  state.board = createEmptyBoard(state.size);
  state.currentPlayer = state.players[0];
  state.gameOver = false;
  state.moves = [];
  buildBoard(state.size, handleCellClick, handleCellHover, handleCellLeave);
  renderBoard(state.board);
  renderMoves(state.moves, state.size);
  setBoardLocked(false);
  setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  renderScoreboard(state.scores, state.players, state.currentPlayer);
  startTimer();
}

// Full Score & History Reset with Thanos Snap Animation
function resetEverythingWithSnap() {
  const filledCells = cellEls.filter(c => c.classList.contains('filled'));
  const movesItems = Array.from(document.querySelectorAll('.move-item'));
  const matchItems = Array.from(document.querySelectorAll('.match-card'));
  const timerBadge = document.getElementById('timer-box');

  const targets = [...filledCells, ...movesItems, ...matchItems, timerBadge];

  triggerThanosSnap(targets, () => {
    // Reset Scores
    state.players.forEach(p => { state.scores[p] = 0; });
    state.scores.draws = 0;
    state.matchLogs = [];
    renderMatchLog(state.matchLogs);
    startNewGame();
  });
}

// Theme Toggle
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = state.theme;
  document.getElementById('theme-toggle').textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

// Change Player Mode
function handleModeChange(e) {
  state.playerCount = parseInt(e.target.value, 10);
  state.players = PLAYER_PRESETS[state.playerCount];
  state.scores = { draws: 0 };
  state.players.forEach(p => { state.scores[p] = 0; });
  updateTagline(state.playerCount, state.size);
  startNewGame();
}

// Change Board Dimension
function handleSizeChange(e) {
  state.size = parseInt(e.target.value, 10);
  updateTagline(state.playerCount, state.size);
  startNewGame();
}

// Wire up events
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('reset-scores-btn').addEventListener('click', resetEverythingWithSnap);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('mode-select').addEventListener('change', handleModeChange);
document.getElementById('size-select').addEventListener('change', handleSizeChange);

// Tabs wiring
document.getElementById('tab-moves').addEventListener('click', () => {
  document.getElementById('tab-moves').classList.add('active');
  document.getElementById('tab-matches').classList.remove('active');
  document.getElementById('moves-container').classList.remove('hidden');
  document.getElementById('matches-container').classList.add('hidden');
});

document.getElementById('tab-matches').addEventListener('click', () => {
  document.getElementById('tab-matches').classList.add('active');
  document.getElementById('tab-moves').classList.remove('active');
  document.getElementById('matches-container').classList.remove('hidden');
  document.getElementById('moves-container').classList.add('hidden');
});

// Initial boot
(function initApp() {
  updateTagline(state.playerCount, state.size);
  startNewGame();
})();
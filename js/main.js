// Game state and event wiring. Connects game.js (rules) and ai.js to ui.js (screen).

const state = {
  size: 3,
  mode: 'pvp', // 'pvp' or 'ai'
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  gameOver: false,
  isAiThinking: false,
  aiTimer: null,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver || state.isAiThinking) return;
  if (state.board[index] !== null) return;

  makeMove(index, state.currentPlayer);

  if (state.gameOver) return;

  if (state.mode === 'ai' && state.currentPlayer === 'O') {
    triggerAiMove();
  }
}

function makeMove(index, player) {
  state.board[index] = player;
  renderBoard(state.board);

  const result = getGameResult(state.board, state.size);

  if (result.status === 'win') {
    state.gameOver = true;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    const winMsg = state.mode === 'ai' && result.winner === 'O'
      ? 'Computer (O) wins!'
      : `Player ${result.winner} wins!`;
    setStatus(winMsg, result.winner);
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
  } else if (result.status === 'draw') {
    state.gameOver = true;
    state.scores.draws++;
    setStatus("It's a draw!", '');
    setBoardLocked(true);
    renderScores(state.scores);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }
}

function triggerAiMove() {
  state.isAiThinking = true;
  setAiThinking(true);
  setStatus('Computer is thinking...', 'O');

  if (state.aiTimer) clearTimeout(state.aiTimer);

  state.aiTimer = setTimeout(() => {
    state.isAiThinking = false;
    setAiThinking(false);
    if (state.gameOver) return;

    const move = getBestMove(state.board, state.size, 'O');
    if (move !== null && state.board[move] === null) {
      makeMove(move, 'O');
    }
  }, 500);
}

function startNewGame() {
  if (state.aiTimer) {
    clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.isAiThinking = false;
  setAiThinking(false);
  state.board = createEmptyBoard(state.size);
  state.currentPlayer = 'X';
  state.gameOver = false;
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  renderScores(state.scores);
}

function handleModeChange(e) {
  state.mode = e.target.value;
  startNewGame();
}

function handleSizeChange(e) {
  const newSize = parseInt(e.target.value, 10);
  if (newSize === state.size) return;
  state.size = newSize;
  buildBoard(state.size, handleCellClick);
  startNewGame();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// Initial setup
const modeSelect = document.getElementById('mode-select');
const sizeSelect = document.getElementById('size-select');
const newGameBtn = document.getElementById('new-game-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

buildBoard(state.size, handleCellClick);
renderBoard(state.board);
renderScores(state.scores);
setStatus("Player X's turn", 'X');

if (modeSelect) modeSelect.addEventListener('change', handleModeChange);
if (sizeSelect) sizeSelect.addEventListener('change', handleSizeChange);
if (newGameBtn) newGameBtn.addEventListener('click', startNewGame);
if (resetScoresBtn) resetScoresBtn.addEventListener('click', resetScores);
if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

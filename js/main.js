// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const COMPUTER_PLAYER = 'O';   // in "vs Computer" mode you are X and the computer is O
const COMPUTER_DELAY = 500;    // ms the computer "thinks" before it moves
const THEME_KEY = 'tictime-theme';

const modeSelect = document.getElementById('mode-select');
const sizeSelect = document.getElementById('size-select');

const state = {
  size: 3,
  mode: 'two-player',          // 'two-player' or 'computer'
  board: createEmptyBoard(3),  // the live board
  moves: [],                   // every move so far: { player, index }
  viewIndex: 0,                // how many moves are on screen (moves.length = live)
  currentPlayer: 'X',
  result: null,                // result of getGameResult() once the game ends
  gameOver: false,
  thinking: false,             // true while the computer is waiting to move
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};
let computerTimer = null;

function playerName(player) {
  if (state.mode === 'computer' && player === COMPUTER_PLAYER) return 'Computer';
  return 'Player ' + player;
}

function isViewingPast() {
  return state.viewIndex !== state.moves.length;
}

// The board as it looked after the first `count` moves.
function boardAt(count) {
  const board = createEmptyBoard(state.size);
  for (let i = 0; i < count; i++) {
    board[state.moves[i].index] = state.moves[i].player;
  }
  return board;
}

function updateStatus() {
  if (isViewingPast()) {
    setStatus(
      state.viewIndex === 0
        ? 'Viewing the game start'
        : 'Viewing move ' + state.viewIndex + ' of ' + state.moves.length,
      ''
    );
  } else if (state.result && state.result.status === 'win') {
    setStatus(playerName(state.result.winner) + ' wins!', state.result.winner);
  } else if (state.gameOver) {
    setStatus("It's a draw!", '');
  } else if (state.thinking) {
    setStatus('Computer is thinking…', state.currentPlayer);
  } else {
    setStatus(playerName(state.currentPlayer) + "'s turn", state.currentPlayer);
  }
}

// Redraws everything from `state`.
function render() {
  renderBoard(boardAt(state.viewIndex));
  clearHighlight();
  if (!isViewingPast() && state.result && state.result.status === 'win') {
    highlightWinningCells(state.result.line);
  }
  setBoardLocked(state.gameOver || state.thinking || isViewingPast());
  updateStatus();
  renderScores(state.scores);
  renderHistory(state.moves, state.viewIndex, jumpToMove);
}

function shouldComputerMove() {
  return state.mode === 'computer' && !state.gameOver && state.currentPlayer === COMPUTER_PLAYER;
}

function playMove(index) {
  const player = state.currentPlayer;
  state.board[index] = player;
  state.moves.push({ player, index });
  state.viewIndex = state.moves.length;

  const result = getGameResult(state.board);
  if (result.status === 'win') {
    state.gameOver = true;
    state.result = result;
    state.scores[result.winner]++;
  } else if (result.status === 'draw') {
    state.gameOver = true;
    state.result = result;
    state.scores.draws++;
  } else {
    state.currentPlayer = nextPlayer(player);
  }

  state.thinking = shouldComputerMove();
  render();

  if (result.status === 'win' && !(state.mode === 'computer' && result.winner === COMPUTER_PLAYER)) {
    launchConfetti();
  }
  if (state.thinking) scheduleComputerMove();
}

function scheduleComputerMove() {
  computerTimer = setTimeout(() => {
    computerTimer = null;
    state.thinking = false;
    const move = getComputerMove(state.board, COMPUTER_PLAYER);
    if (move >= 0) playMove(move);
  }, COMPUTER_DELAY);
}

function handleCellClick(index) {
  if (state.gameOver || state.thinking || isViewingPast() || state.board[index] !== null) return;
  playMove(index);
}

function jumpToMove(step) {
  state.viewIndex = step;
  render();
}

function startNewGame() {
  clearTimeout(computerTimer);
  computerTimer = null;
  state.board = createEmptyBoard(state.size);
  state.moves = [];
  state.viewIndex = 0;
  state.currentPlayer = 'X';
  state.result = null;
  state.gameOver = false;
  state.thinking = false;
  render();
}

// Called when the Mode or Board size menu changes: fresh game, fresh scores.
function applyOptions() {
  state.mode = modeSelect.value;
  const newSize = Number(sizeSelect.value);
  if (newSize !== state.size) {
    state.size = newSize;
    buildBoard(handleCellClick, state.size);
  }
  state.scores = { X: 0, O: 0, draws: 0 };
  setPlayerLabels('Player X', playerName('O'));
  setHint('Get ' + getWinLength(state.size) + ' in a row to win');
  startNewGame();
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  renderScores(state.scores);
}

// ---------- Theme (remembered between visits) ----------

function loadSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // storage can be blocked (private mode); the theme just won't be remembered
  }
}

function initTheme() {
  const saved = loadSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'light' || saved === 'dark') {
    state.theme = saved;
  } else {
    state.theme = prefersDark ? 'dark' : 'light';
  }
  setTheme(state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
  saveTheme(state.theme);
}

// ---------- Start up ----------

// Browsers can restore menu choices on reload, so read them instead of assuming.
state.mode = modeSelect.value;
state.size = Number(sizeSelect.value);
state.board = createEmptyBoard(state.size);

buildBoard(handleCellClick, state.size);
initTheme();
setPlayerLabels('Player X', playerName('O'));
setHint('Get ' + getWinLength(state.size) + ' in a row to win');
render();

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('reset-scores-btn').addEventListener('click', resetScores);
modeSelect.addEventListener('change', applyOptions);
sizeSelect.addEventListener('change', applyOptions);
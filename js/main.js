// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function snapshot(player = null, square = null) {
  return { board: state.board.slice(), currentPlayer: state.currentPlayer,
    gameOver: state.gameOver, scores: { ...state.scores }, player, square };
}

let history = [snapshot()];
let currentMove = 0;

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  history = history.slice(0, currentMove + 1);
  const player = state.currentPlayer;

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
  history.push(snapshot(player, index));
  currentMove = history.length - 1;
  renderHistory(history, currentMove, jumpToMove);
}

function jumpToMove(move) {
  const entry = history[move];
  if (!entry) return;
  currentMove = move;
  state.board = entry.board.slice();
  state.currentPlayer = entry.currentPlayer;
  state.gameOver = entry.gameOver;
  state.scores = { ...entry.scores };
  clearWinningCells();
  renderBoard(state.board);
  renderScores(state.scores);
  setBoardLocked(state.gameOver);
  const result = getGameResult(state.board);
  if (result.status === 'win') {
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
  } else if (result.status === 'draw') {
    setStatus("It's a draw!", '');
  } else {
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }
  renderHistory(history, currentMove, jumpToMove);
}

function startNewGame() {
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;
  clearWinningCells();
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
  history = [snapshot()];
  currentMove = 0;
  renderHistory(history, currentMove, jumpToMove);
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
renderHistory(history, currentMove, jumpToMove);
document.getElementById('undo-btn').addEventListener('click', () => {
  if (currentMove > 0) jumpToMove(currentMove - 1);
});
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

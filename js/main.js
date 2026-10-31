// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  boardSize: 3,
  board: createEmptyBoard(3),
  moves: [],
  positions: [createEmptyBoard(3)],
  currentMove: 0,
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  if (state.currentMove < state.moves.length) {
    state.moves = state.moves.slice(0, state.currentMove);
    state.positions = state.positions.slice(0, state.currentMove + 1);
  }

  const player = state.currentPlayer;
  state.board[index] = player;
  renderBoard(state.board);

  const result = getGameResult(state.board, state.boardSize);

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
    state.scores.draws++;
    renderScores(state.scores);
    setStatus("It's a draw!", '');
    setBoardLocked(true);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  state.moves.push({ player, index });
  state.positions.push(state.board.slice());
  state.currentMove = state.moves.length;
  renderMoveHistory(state.moves, state.currentMove, showMove);
  updateUndoButton();
}

function startNewGame() {
  state.board = createEmptyBoard(state.boardSize);
  state.moves = [];
  state.positions = [state.board.slice()];
  state.currentMove = 0;
  state.currentPlayer = 'X';
  state.gameOver = false;
  buildBoard(handleCellClick, state.boardSize);
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
  renderMoveHistory(state.moves, state.currentMove, showMove);
  updateUndoButton();
}

function showMove(moveNumber) {
  state.currentMove = moveNumber;
  state.board = state.positions[moveNumber].slice();
  clearWinningCells();
  renderBoard(state.board);

  const result = getGameResult(state.board, state.boardSize);
  state.gameOver = result.status !== 'playing';

  if (result.status === 'win') {
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
  } else if (result.status === 'draw') {
    setStatus("It's a draw!", '');
  } else {
    state.currentPlayer = moveNumber % 2 === 0 ? 'X' : 'O';
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  setBoardLocked(state.gameOver);
  renderMoveHistory(state.moves, state.currentMove, showMove);
  updateUndoButton();
}

function updateUndoButton() {
  document.getElementById('undo-btn').disabled = state.currentMove === 0;
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// TODO: wire up the "Reset Scores" button (#reset-scores-btn)

const sizeSelect = document.getElementById('size-select');
sizeSelect.addEventListener('change', () => {
  state.boardSize = Number(sizeSelect.value);
  startNewGame();
});

buildBoard(handleCellClick, state.boardSize);
renderBoard(state.board);
renderScores(state.scores);
renderMoveHistory(state.moves, state.currentMove, showMove);
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('undo-btn').addEventListener('click', () => {
  if (state.currentMove > 0) showMove(state.currentMove - 1);
});
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

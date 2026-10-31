// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  boardSize: 3,
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  state.board[index] = state.currentPlayer;
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
}

function startNewGame() {
  state.board = createEmptyBoard(state.boardSize);
  state.currentPlayer = 'X';
  state.gameOver = false;
  buildBoard(handleCellClick, state.boardSize);
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
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
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

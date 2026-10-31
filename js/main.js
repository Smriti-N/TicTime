
// Main game controller.

const state = {
  boardSize: 3,
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  gameOver: false,

  scores: {
    X: 0,
    O: 0,
    draws: 0
  },

  theme: 'light'
};

// Handle a player's move.
function handleCellClick(index) {

  // Prevent moves after game over or on occupied cells.
  if (state.gameOver || state.board[index] !== null) {
    return;
  }

  // Place the current player's mark.
  state.board[index] = state.currentPlayer;

  renderBoard(state.board);

  // Check the game result.
  const result = getGameResult(state.board, state.boardSize);

  // Someone has won.
  if (result.status === 'win') {

    state.gameOver = true;

    state.scores[result.winner]++;

    renderScores(state.scores);

    setStatus(`Player ${result.winner} wins!`, result.winner);

    setBoardLocked(true);

    highlightWinningCells(result.line);

    launchConfetti();

    return;
  }

  // Draw.
  if (result.status === 'draw') {

    state.gameOver = true;

    state.scores.draws++;

    renderScores(state.scores);

    setStatus("It's a draw!", '');

    setBoardLocked(true);

    return;
  }

  // Switch player.
  state.currentPlayer = nextPlayer(state.currentPlayer);

  setStatus(
    `Player ${state.currentPlayer}'s turn`,
    state.currentPlayer
  );
}

// Start a new game.
function startNewGame() {

  state.board = createEmptyBoard(state.boardSize);

  state.currentPlayer = 'X';

  state.gameOver = false;

  buildBoard(state.boardSize, handleCellClick);

  renderBoard(state.board);

  setBoardLocked(false);

  setStatus("Player X's turn", 'X');
}

// Reset scoreboard.
function resetScores() {

  state.scores = {
    X: 0,
    O: 0,
    draws: 0
  };

  renderScores(state.scores);
}

// Change board size.
function changeBoardSize(event) {

  state.boardSize = Number(event.target.value);

  // Start a fresh game with the new board size.
  // Existing scores are preserved.
  startNewGame();
}

// Toggle light/dark theme.
function toggleTheme() {

  state.theme = state.theme === 'light' ? 'dark' : 'light';

  setTheme(state.theme);
}

// Event listeners.
document.getElementById('new-game-btn')
  .addEventListener('click', startNewGame);

document.getElementById('reset-scores-btn')
  .addEventListener('click', resetScores);

document.getElementById('theme-toggle')
  .addEventListener('click', toggleTheme);

document.getElementById('size-select')
  .addEventListener('change', changeBoardSize);

// Initialize the game.
setTheme(state.theme);

renderScores(state.scores);

startNewGame();

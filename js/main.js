// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  boardSize: 3,
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  movePlayed: false
};

function handleCellClick(index) {
  if (state.gameOver) return;
  
  if (state.board[index] == null) {
    state.board[index] = state.currentPlayer;
    state.movePlayed = true;
  }

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
    setStatus("It's a draw!", '');
    state.scores['draws']++;
    renderScores(state.scores);
    setBoardLocked(true);
  } else if (state.movePlayed) {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
    state.movePlayed = false;
  }
}

function startNewGame() {
  state.board = createEmptyBoard(state.boardSize);
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.movePlayed = false;
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
}

function changeBoardSize(size) {
  state.boardSize = Number(size);
  buildBoard(handleCellClick, state.boardSize);
  startNewGame();
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  renderScores(state.scores);
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// TODO: wire up the "Reset Scores" button (#reset-scores-btn)

buildBoard(handleCellClick, state.boardSize);
renderBoard(state.board);
renderScores(state.scores);
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('reset-scores-btn').addEventListener('click', () => {
  resetScores();
});
document.getElementById('size-select').addEventListener('change', (event) => {
  changeBoardSize(event.target.value);
});

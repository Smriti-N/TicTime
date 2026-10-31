// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  mode: 'two-player',
};

let computerMoveTimeout;

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;
  if (state.mode === 'computer' && state.currentPlayer !== 'X') return;

  playMove(index);
}

function playMove(index) {
  state.board[index] = state.currentPlayer;
  renderBoard(state.board);

  const result = getGameResult(state.board);

  if (result.status === 'win') {
    state.gameOver = true;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    setStatus(state.mode === 'computer' && result.winner === 'O' ? 'Computer wins!' : `Player ${result.winner} wins!`, result.winner);
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
  } else if (result.status === 'draw') {
    state.gameOver = true;
    setStatus("It's a draw!", '');
    setBoardLocked(true);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    const computerTurn = state.mode === 'computer' && state.currentPlayer === 'O';
    setStatus(computerTurn ? "Computer's turn" : `Player ${state.currentPlayer}'s turn`, state.currentPlayer);
    if (computerTurn) {
      setBoardLocked(true);
      computerMoveTimeout = setTimeout(() => {
        computerMoveTimeout = null;
        if (state.gameOver || state.mode !== 'computer' || state.currentPlayer !== 'O') return;
        setBoardLocked(false);
        playMove(getBestMove(state.board, 'O'));
      }, 350);
    }
  }
}

function startNewGame() {
  clearTimeout(computerMoveTimeout);
  computerMoveTimeout = null;
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// TODO: wire up the "Reset Scores" button (#reset-scores-btn)

buildBoard(handleCellClick);
renderBoard(state.board);
renderScores(state.scores);
setGameMode(state.mode);
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('mode-select').addEventListener('change', (event) => {
  state.mode = event.target.value;
  setGameMode(state.mode);
  startNewGame();
});

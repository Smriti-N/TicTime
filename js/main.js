// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  mode: 'human',
};

let computerTimer = null;

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;
  if (state.mode === 'computer' && state.currentPlayer === 'O') return;
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
    if (state.mode === 'computer' && state.currentPlayer === 'O') {
      setBoardLocked(true);
      computerTimer = setTimeout(() => {
        computerTimer = null;
        const move = getComputerMove(state.board);
        if (move !== null) playMove(move);
        setBoardLocked(state.gameOver);
      }, 500);
    }
  }
}

function startNewGame() {
  clearTimeout(computerTimer);
  computerTimer = null;
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
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('mode-select').addEventListener('change', (event) => {
  state.mode = event.target.value;
  startNewGame();
});

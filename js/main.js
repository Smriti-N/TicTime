// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  computerThinking: false,
  mode: 'two-players',
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver || state.computerThinking) return;
  if (state.board[index] !== null) return;

  if (state.mode === 'computer' && state.currentPlayer === 'O') return;

  makeMove(index, state.currentPlayer);
}

function makeMove(index, player) {
  state.board[index] = player;
  renderBoard(state.board);

  const result = getGameResult(state.board);

  if (result.status === 'win') {
    state.gameOver = true;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    setStatus(
      state.mode === 'computer' && result.winner === 'X'
        ? 'You win!'
        : state.mode === 'computer' && result.winner === 'O'
          ? 'Computer wins!'
          : `Player ${result.winner} wins!`,
      result.winner
    );
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
    return;
  }

  if (result.status === 'draw') {
    state.gameOver = true;
    state.scores.draws++;
    setStatus("It's a draw!", '');
    setBoardLocked(true);
    renderScores(state.scores);
    return;
  }

  state.currentPlayer = nextPlayer(player);
  setStatus(
    state.mode === 'computer' && state.currentPlayer === 'O'
      ? 'Computer is thinking...'
      : state.mode === 'computer'
        ? 'Your turn!'
        : `Player ${state.currentPlayer}'s turn`,
    state.currentPlayer
  );

  if (state.mode === 'computer' && state.currentPlayer === 'O') {
    state.computerThinking = true;

    setTimeout(() => {
      if (state.gameOver) return;

      const computerMove = findBestMove(state.board);

      if (computerMove !== -1) {
        state.computerThinking = false;
        makeMove(computerMove, 'O');
      }
    }, 500);
  }
}

function startNewGame() {
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.computerThinking = false;

  renderBoard(state.board);
  setBoardLocked(false);
  setStatus(
    state.mode === 'computer' ? 'Your turn!' : "Player X's turn",
    'X'
  );
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
const modeSelect = document.getElementById('mode-select');

modeSelect.disabled = false;

modeSelect.addEventListener('change', (event) => {
  state.mode = event.target.value === 'vs Computer'
    ? 'computer'
    : 'two-players';

  startNewGame();
});
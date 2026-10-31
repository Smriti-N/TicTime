// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  history: [],
  historyIndex: 0,
  scoredResult: null,
};

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  if (state.historyIndex < state.history.length) {
    state.history = state.history.slice(0, state.historyIndex);
    if (state.scoredResult) {
      if (state.scoredResult.status === 'win') {
        state.scores[state.scoredResult.winner]--;
      } else {
        state.scores.draws--;
      }
      state.scoredResult = null;
      renderScores(state.scores);
    }
  }

  const player = state.currentPlayer;
  state.board[index] = state.currentPlayer;
  state.history.push({ player, square: index, board: state.board.slice() });
  state.historyIndex = state.history.length;
  renderHistory(state.history, state.historyIndex, handleHistoryClick);
  renderBoard(state.board);

  const result = getGameResult(state.board);

  if (result.status === 'win') {
    state.gameOver = true;
    state.scoredResult = result;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
  } else if (result.status === 'draw') {
    state.gameOver = true;
    state.scoredResult = result;
    state.scores.draws++;
    setStatus("It's a draw!", '');
    setBoardLocked(true);
    renderScores(state.scores);
  } else {
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }
}

function handleHistoryClick(index) {
  const move = state.history[index];
  if (!move) return;

  state.board = move.board.slice();
  state.currentPlayer = nextPlayer(move.player);
  state.historyIndex = index + 1;

  const result = getGameResult(state.board);
  state.gameOver = result.status !== 'playing';
  renderBoard(state.board);
  setBoardLocked(state.gameOver);
  renderHistory(state.history, state.historyIndex, handleHistoryClick);

  if (result.status === 'win') {
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
  } else if (result.status === 'draw') {
    setStatus("It's a draw!", '');
  } else {
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }
}

function startNewGame() {
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.history = [];
  state.historyIndex = 0;
  state.scoredResult = null;
  renderBoard(state.board);
  renderHistory(state.history, state.historyIndex, handleHistoryClick);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  state.scoredResult = null;
  renderScores(state.scores);
}

buildBoard(handleCellClick);
renderBoard(state.board);
renderHistory(state.history, state.historyIndex, handleHistoryClick);
renderScores(state.scores);
setStatus("Player X's turn", 'X');
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.getElementById('reset-scores-btn').addEventListener('click', resetScores);

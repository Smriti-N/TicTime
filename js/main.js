// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
};

const moveHistory = [];
let historyCursor = 0;


function updateMoveHistory() {
  const moves = moveHistory;

  renderMoveHistory(
    moves,
    historyCursor,
    showHistoryPosition
  );

  document.getElementById('undo-btn').disabled =
    historyCursor === 0;
}

function showHistoryPosition(ply) {
  historyCursor = ply;

  state.board = createEmptyBoard();

  for (const move of moveHistory.slice(0, ply)) {
    state.board[move.square] = move.player;
  }

  const result = getGameResult(state.board);

  state.gameOver = result.status !== 'playing';

  state.currentPlayer =
    ply === 0 ? 'X' : nextPlayer(moveHistory[ply - 1].player);

  renderBoard(state.board);

  // Remove old winning highlights before applying new ones.
  clearWinningHighlights();

  if (result.status === 'win') {
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
  } else if (result.status === 'draw') {
    setStatus("It's a draw!", '');
  } else {
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  setBoardLocked(state.gameOver);
  updateMoveHistory();
}



function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  // Starting a new branch discards the abandoned future.
  moveHistory.splice(historyCursor);

  const player = state.currentPlayer;

  state.board[index] = player;

  moveHistory.push({
    player,
    square: index,
  });

  historyCursor++;

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

  updateMoveHistory();
}



function startNewGame() {
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.gameOver = false;

  moveHistory.length = 0;
  historyCursor = 0;

  clearWinningHighlights();
  renderBoard(state.board);
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');

  updateMoveHistory();
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

document.getElementById('undo-btn').addEventListener('click', () => {
  if (historyCursor === 0) return;

  showHistoryPosition(historyCursor - 1);
});

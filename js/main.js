// Game state and event wiring. Connects game.js (rules) to ui.js (screen).

const state = {
  board: createEmptyBoard(),
  currentPlayer: 'X',
  gameOver: false,
  scores: { X: 0, O: 0, draws: 0 },
  moves: [],
  currentMove: 0,
  scoredWinner: null,
  theme: 'light',
};

function handleCellClick(index) {
  if (state.gameOver || state.board[index] !== null) return;

  if (state.currentMove < state.moves.length) {
    state.moves = state.moves.slice(0, state.currentMove);
    if (state.scoredWinner) {
      state.scores[state.scoredWinner]--;
      state.scoredWinner = null;
      renderScores(state.scores);
    }
  }

  state.moves.push({ player: state.currentPlayer, index });
  state.currentMove = state.moves.length;
  state.board[index] = state.currentPlayer;
  const result = getGameResult(state.board);

  if (result.status === 'win') {
    state.scores[result.winner]++;
    state.scoredWinner = result.winner;
    renderScores(state.scores);
    launchConfetti();
  }

  renderPosition();
}

function renderPosition() {
  state.board = createEmptyBoard();
  for (const move of state.moves.slice(0, state.currentMove)) {
    state.board[move.index] = move.player;
  }
  state.currentPlayer = state.currentMove % 2 === 0 ? 'X' : 'O';

  const result = getGameResult(state.board);
  state.gameOver = result.status !== 'playing';
  renderBoard(state.board);

  if (result.status === 'win') {
    highlightWinningCells(result.line);
    setStatus(`Player ${result.winner} wins!`, result.winner);
  } else if (result.status === 'draw') {
    setStatus("It's a draw!", '');
  } else {
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  setBoardLocked(state.gameOver);
  setUndoEnabled(state.currentMove > 0);
  renderHistory(state.moves, state.currentMove, selectHistoryMove);
}

function selectHistoryMove(moveNumber) {
  state.currentMove = moveNumber;
  renderPosition();
}

function undoMove() {
  if (state.currentMove === 0) return;

  state.moves = state.moves.slice(0, state.currentMove - 1);
  state.currentMove--;
  if (state.scoredWinner) {
    state.scores[state.scoredWinner]--;
    state.scoredWinner = null;
    renderScores(state.scores);
  }
  renderPosition();
}

function startNewGame() {
  state.moves = [];
  state.currentMove = 0;
  state.scoredWinner = null;
  renderPosition();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
}

// TODO: wire up the "Reset Scores" button (#reset-scores-btn)

buildBoard(handleCellClick);
renderPosition();
renderScores(state.scores);
document.getElementById('new-game-btn').addEventListener('click', startNewGame);
document.getElementById('undo-btn').addEventListener('click', undoMove);
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

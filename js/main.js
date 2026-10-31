// Game state and event wiring. Connects game.js (rules) and ai.js to ui.js (screen).

const state = {
  size: 3,
  mode: 'pvp', // 'pvp' or 'ai'
  board: createEmptyBoard(3),
  currentPlayer: 'X',
  gameOver: false,
  isAiThinking: false,
  aiTimer: null,
  scores: { X: 0, O: 0, draws: 0 },
  theme: 'light',
  history: [], // Array of move entries { step, player, index, row, col, board, status, winner, line }
  viewingStep: null, // null means viewing live / latest, or a number (0 = start, 1..N = past move)
};

function handleCellClick(index) {
  if (state.isAiThinking) return;

  // If currently browsing a past step in history:
  if (state.viewingStep !== null && state.viewingStep < state.history.length) {
    const currentStepRecord = state.viewingStep === 0 ? null : state.history[state.viewingStep - 1];
    if (currentStepRecord && currentStepRecord.status !== 'playing') return;

    const nextP = state.viewingStep === 0 ? 'X' : nextPlayer(currentStepRecord.player);

    // In vs Computer mode, human plays as 'X' only
    if (state.mode === 'ai' && nextP === 'O') {
      setStatus("It's Computer's turn at this step. Choose an X move to branch.", 'O');
      return;
    }

    const currentBoard = state.viewingStep === 0 ? createEmptyBoard(state.size) : currentStepRecord.board;
    if (currentBoard[index] !== null) return;

    // Branch history: truncate from viewingStep onward and resume live game
    state.history = state.history.slice(0, state.viewingStep);
    state.board = [...currentBoard];
    state.currentPlayer = nextP;
    state.gameOver = false;
    state.viewingStep = null;
    setBoardLocked(false);

    makeMove(index, state.currentPlayer);

    if (state.gameOver) return;

    if (state.mode === 'ai' && state.currentPlayer === 'O') {
      triggerAiMove();
    }
    return;
  }

  // Normal live gameplay
  if (state.gameOver) return;
  if (state.board[index] !== null) return;

  makeMove(index, state.currentPlayer);

  if (state.gameOver) return;

  if (state.mode === 'ai' && state.currentPlayer === 'O') {
    triggerAiMove();
  }
}

function makeMove(index, player) {
  state.board[index] = player;
  renderBoard(state.board);
  highlightLastMove(index);

  const result = getGameResult(state.board, state.size);
  const coords = getCellCoordinates(index, state.size);

  state.history.push({
    step: state.history.length + 1,
    player: player,
    index: index,
    row: coords.row,
    col: coords.col,
    board: [...state.board],
    status: result.status,
    winner: result.winner,
    line: result.line,
  });
  state.viewingStep = null;

  if (result.status === 'win') {
    state.gameOver = true;
    state.scores[result.winner]++;
    highlightWinningCells(result.line);
    const winMsg = state.mode === 'ai' && result.winner === 'O'
      ? 'Computer (O) wins!'
      : `Player ${result.winner} wins!`;
    setStatus(winMsg, result.winner);
    setBoardLocked(true);
    renderScores(state.scores);
    launchConfetti();
  } else if (result.status === 'draw') {
    state.gameOver = true;
    state.scores.draws++;
    clearWinningHighlight();
    setStatus("It's a draw!", '');
    setBoardLocked(true);
    renderScores(state.scores);
  } else {
    clearWinningHighlight();
    state.currentPlayer = nextPlayer(state.currentPlayer);
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  renderHistory(state.history, state.viewingStep, handleJumpToStep);
}

function handleJumpToStep(stepNumber) {
  if (state.aiTimer) {
    clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.isAiThinking = false;
  setAiThinking(false);

  state.viewingStep = stepNumber;

  if (stepNumber === 0) {
    renderBoard(createEmptyBoard(state.size));
    highlightLastMove(null);
    clearWinningHighlight();
    setBoardLocked(false);
    setStatus('Viewing game start (Player X to move)', 'X');
  } else {
    const move = state.history[stepNumber - 1];
    renderBoard(move.board);
    highlightLastMove(move.index);

    if (move.status === 'win') {
      highlightWinningCells(move.line);
      const winMsg = state.mode === 'ai' && move.winner === 'O'
        ? 'Computer (O) wins!'
        : `Player ${move.winner} wins!`;
      setStatus(winMsg, move.winner);
      setBoardLocked(true);
    } else if (move.status === 'draw') {
      clearWinningHighlight();
      setStatus("It's a draw!", '');
      setBoardLocked(true);
    } else {
      clearWinningHighlight();
      const nextP = nextPlayer(move.player);
      if (stepNumber === state.history.length) {
        setStatus(`Player ${nextP}'s turn`, nextP);
        setBoardLocked(false);
      } else {
        setStatus(`Viewing move #${move.step} (Player ${move.player})`, move.player);
        setBoardLocked(false);
      }
    }
  }

  renderHistory(state.history, state.viewingStep, handleJumpToStep);
}

function handleResumeCurrent() {
  if (state.history.length === 0) {
    handleJumpToStep(0);
    return;
  }
  handleJumpToStep(state.history.length);
  state.viewingStep = null;
  renderHistory(state.history, state.viewingStep, handleJumpToStep);

  const latestMove = state.history[state.history.length - 1];
  if (latestMove.status === 'playing') {
    state.currentPlayer = nextPlayer(latestMove.player);
    if (state.mode === 'ai' && state.currentPlayer === 'O' && !state.gameOver) {
      triggerAiMove();
    }
  }
}

function triggerAiMove() {
  state.isAiThinking = true;
  setAiThinking(true);
  setStatus('Computer is thinking...', 'O');

  if (state.aiTimer) clearTimeout(state.aiTimer);

  state.aiTimer = setTimeout(() => {
    state.isAiThinking = false;
    setAiThinking(false);
    if (state.gameOver) return;

    const move = getBestMove(state.board, state.size, 'O');
    if (move !== null && state.board[move] === null) {
      makeMove(move, 'O');
    }
  }, 500);
}

function startNewGame() {
  if (state.aiTimer) {
    clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }
  state.isAiThinking = false;
  setAiThinking(false);
  state.board = createEmptyBoard(state.size);
  state.currentPlayer = 'X';
  state.gameOver = false;
  state.history = [];
  state.viewingStep = null;
  renderBoard(state.board);
  highlightLastMove(null);
  clearWinningHighlight();
  setBoardLocked(false);
  setStatus("Player X's turn", 'X');
  renderHistory(state.history, state.viewingStep, handleJumpToStep);
}

function resetScores() {
  state.scores = { X: 0, O: 0, draws: 0 };
  renderScores(state.scores);
}

function handleModeChange(e) {
  state.mode = e.target.value;
  startNewGame();
}

function handleSizeChange(e) {
  const newSize = parseInt(e.target.value, 10);
  if (newSize === state.size) return;
  state.size = newSize;
  buildBoard(state.size, handleCellClick);
  startNewGame();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(state.theme);
  try {
    localStorage.setItem('tictime-theme', state.theme);
  } catch (e) {
    // ignore storage access errors
  }
}

function handleUndo() {
  if (state.isAiThinking || state.history.length === 0) return;

  if (state.aiTimer) {
    clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }

  // Determine how many moves to roll back
  let movesToUndo = 1;
  if (state.mode === 'ai') {
    const lastMove = state.history[state.history.length - 1];
    if (lastMove.player === 'O' && state.history.length >= 2) {
      movesToUndo = 2;
    }
  }

  // If reverting a game-ending move, decrement scores accordingly
  for (let i = 0; i < movesToUndo; i++) {
    const undoneMove = state.history[state.history.length - 1 - i];
    if (undoneMove.status === 'win') {
      state.scores[undoneMove.winner] = Math.max(0, state.scores[undoneMove.winner] - 1);
      renderScores(state.scores);
    } else if (undoneMove.status === 'draw') {
      state.scores.draws = Math.max(0, state.scores.draws - 1);
      renderScores(state.scores);
    }
  }

  const targetLength = state.history.length - movesToUndo;
  state.history = state.history.slice(0, targetLength);
  state.gameOver = false;
  state.viewingStep = null;
  setBoardLocked(false);

  if (targetLength === 0) {
    state.board = createEmptyBoard(state.size);
    state.currentPlayer = 'X';
    renderBoard(state.board);
    highlightLastMove(null);
    clearWinningHighlight();
    setStatus("Player X's turn", 'X');
  } else {
    const currentLast = state.history[targetLength - 1];
    state.board = [...currentLast.board];
    state.currentPlayer = nextPlayer(currentLast.player);
    renderBoard(state.board);
    highlightLastMove(currentLast.index);
    clearWinningHighlight();
    setStatus(`Player ${state.currentPlayer}'s turn`, state.currentPlayer);
  }

  renderHistory(state.history, state.viewingStep, handleJumpToStep);
}

// Initial setup
const modeSelect = document.getElementById('mode-select');
const sizeSelect = document.getElementById('size-select');
const newGameBtn = document.getElementById('new-game-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const historyCurrentBtn = document.getElementById('history-current-btn');
const undoBtn = document.getElementById('undo-btn');

try {
  const savedTheme = localStorage.getItem('tictime-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    state.theme = savedTheme;
    setTheme(state.theme);
  }
} catch (e) {
  // ignore storage access errors
}

buildBoard(state.size, handleCellClick);
renderBoard(state.board);
renderScores(state.scores);
setStatus("Player X's turn", 'X');
renderHistory(state.history, state.viewingStep, handleJumpToStep);

if (modeSelect) modeSelect.addEventListener('change', handleModeChange);
if (sizeSelect) sizeSelect.addEventListener('change', handleSizeChange);
if (newGameBtn) newGameBtn.addEventListener('click', startNewGame);
if (resetScoresBtn) resetScoresBtn.addEventListener('click', resetScores);
if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (historyCurrentBtn) historyCurrentBtn.addEventListener('click', handleResumeCurrent);
if (undoBtn) undoBtn.addEventListener('click', handleUndo);

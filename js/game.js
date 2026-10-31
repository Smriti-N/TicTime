// Game rules for TicTime. No DOM code lives here.

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 7],
];

function createEmptyBoard() {
  return Array(9).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}

function getBestMove(board, player) {
  const opponent = nextPlayer(player);
  let bestScore = -Infinity;
  let bestMove = null;

  for (let index = 0; index < board.length; index++) {
    if (board[index] !== null) continue;
    board[index] = player;
    const score = minimax(board, false, player, opponent, 1);
    board[index] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

function minimax(board, maximizing, player, opponent, depth) {
  const result = getGameResult(board);
  if (result.status === 'win') {
    return result.winner === player ? 10 - depth : depth - 10;
  }
  if (result.status === 'draw') return 0;

  let bestScore = maximizing ? -Infinity : Infinity;
  const currentPlayer = maximizing ? player : opponent;

  for (let index = 0; index < board.length; index++) {
    if (board[index] !== null) continue;
    board[index] = currentPlayer;
    const score = minimax(board, !maximizing, player, opponent, depth + 1);
    board[index] = null;
    bestScore = maximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
  }

  return bestScore;
}

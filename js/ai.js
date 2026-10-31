// AI logic using the Minimax algorithm.
// The computer plays as O and the human plays as X.

function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = 'O';

      const score = minimax(board, 0, false);

      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const result = getGameResult(board);

  if (result.status === 'win') {
    return result.winner === 'O' ? 10 - depth : depth - 10;
  }

  if (result.status === 'draw') {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }

    return bestScore;
  }
}
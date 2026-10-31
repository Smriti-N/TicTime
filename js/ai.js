// Search every continuation: O maximizes its result, X minimizes it.
function getComputerMove(board) {
  const position = board.slice();

  function minimax(player) {
    const result = getGameResult(position);
    if (result.status === 'win') return result.winner === 'O' ? 1 : -1;
    if (result.status === 'draw') return 0;

    let best = player === 'O' ? -Infinity : Infinity;
    for (let index = 0; index < position.length; index++) {
      if (position[index] !== null) continue;
      position[index] = player;
      const score = minimax(nextPlayer(player));
      position[index] = null;
      best = player === 'O' ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  if (getGameResult(position).status !== 'playing') return null;
  let bestScore = -Infinity;
  let bestMove = null;
  for (let index = 0; index < position.length; index++) {
    if (position[index] !== null) continue;
    position[index] = 'O';
    const score = minimax('X');
    position[index] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }
  return bestMove;
}

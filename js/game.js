// Game rules for TicTime. No DOM code lives here.

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board) {
  const size = Math.sqrt(board.length);
  const target = size === 3 ? 3 : 4;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const start = row * size + column;
      if (!board[start]) continue;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const endRow = row + (target - 1) * dr;
        const endColumn = column + (target - 1) * dc;
        if (endRow >= size || endColumn < 0 || endColumn >= size) continue;
        const line = Array.from({ length: target }, (_, step) => (row + step * dr) * size + column + step * dc);
        if (line.every((index) => board[index] === board[start])) {
          return { status: 'win', winner: board[start], line };
        }
      }
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}

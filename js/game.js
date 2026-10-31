// Game rules for TicTime. No DOM code lives here.

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getWinningLines(size) {
  const lines = [];
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (const [rowStep, colStep] of directions) {
        const endRow = row + (size - 1) * rowStep;
        const endCol = col + (size - 1) * colStep;
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

        const line = [];
        for (let step = 0; step < size; step++) {
          line.push((row + step * rowStep) * size + col + step * colStep);
        }
        lines.push(line);
      }
    }
  }

  return lines;
}

function getGameResult(board) {
  const size = Math.sqrt(board.length);
  for (const line of getWinningLines(size)) {
    const winner = board[line[0]];
    if (winner && line.every((index) => board[index] === winner)) {
      return { status: 'win', winner, line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}

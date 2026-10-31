// Game rules for TicTime. No DOM code lives here.

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getWinLines(size) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  const lines = [];

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      for (const [rowStep, columnStep] of directions) {
        const endRow = row + (size - 1) * rowStep;
        const endColumn = column + (size - 1) * columnStep;
        if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) continue;

        const line = [];
        for (let step = 0; step < size; step++) {
          line.push((row + step * rowStep) * size + column + step * columnStep);
        }
        lines.push(line);
      }
    }
  }

  return lines;
}

function getGameResult(board, size = Math.sqrt(board.length)) {
  for (const line of getWinLines(size)) {
    const [first, ...rest] = line;
    if (board[first] !== null && rest.every((index) => board[index] === board[first])) {
      return { status: 'win', winner: board[first], line };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }

  return { status: 'playing', winner: null, line: null };
}

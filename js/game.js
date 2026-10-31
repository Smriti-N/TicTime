// Game rules for TicTime. No DOM code lives here.

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board, size = Math.sqrt(board.length)) {
  const winLength = size === 3 ? 3 : 4;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      for (const [rowStep, columnStep] of directions) {
        const endRow = row + (winLength - 1) * rowStep;
        const endColumn = column + (winLength - 1) * columnStep;
        if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) continue;

        const line = Array.from({ length: winLength }, (_, offset) =>
          (row + offset * rowStep) * size + column + offset * columnStep
        );
        const [first, ...rest] = line;
        if (board[first] && rest.every((index) => board[index] === board[first])) {
          return { status: 'win', winner: board[first], line };
        }
      }
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}

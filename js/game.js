// Game rules for TicTime. No DOM code lives here.

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board, size = Math.sqrt(board.length)) {
  const lines = [];
  for (let i = 0; i < size; i++) {
    lines.push(
      Array.from({ length: size }, (_, j) => i * size + j),
      Array.from({ length: size }, (_, j) => j * size + i),
    );
  }
  lines.push(
    Array.from({ length: size }, (_, i) => i * size + i),
    Array.from({ length: size }, (_, i) => i * size + size - 1 - i),
  );

  for (const line of lines) {
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

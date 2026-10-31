// Game rules for TicTime. No DOM code lives here.

function getWinTarget(size = 3) {
  return size === 3 ? 3 : 4;
}

function getWinLines(size = 3) {
  const k = getWinTarget(size);
  const lines = [];

  // Horizontal lines (rows)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - k; c++) {
      const line = [];
      for (let i = 0; i < k; i++) line.push(r * size + c + i);
      lines.push(line);
    }
  }

  // Vertical lines (columns)
  for (let r = 0; r <= size - k; r++) {
    for (let c = 0; c < size; c++) {
      const line = [];
      for (let i = 0; i < k; i++) line.push((r + i) * size + c);
      lines.push(line);
    }
  }

  // Main diagonal (\)
  for (let r = 0; r <= size - k; r++) {
    for (let c = 0; c <= size - k; c++) {
      const line = [];
      for (let i = 0; i < k; i++) line.push((r + i) * size + (c + i));
      lines.push(line);
    }
  }

  // Anti-diagonal (/)
  for (let r = 0; r <= size - k; r++) {
    for (let c = k - 1; c < size; c++) {
      const line = [];
      for (let i = 0; i < k; i++) line.push((r + i) * size + (c - i));
      lines.push(line);
    }
  }

  return lines;
}

const WIN_LINES = getWinLines(3);

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board, size = 3) {
  const lines = getWinLines(size);

  // Check winning lines first
  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((idx) => board[idx] === first)) {
      return { status: 'win', winner: first, line };
    }
  }

  // Check draw if all cells are filled
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }

  return { status: 'playing', winner: null, line: null };
}

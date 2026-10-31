
// Game rules for TicTime. No DOM code lives here.

// Create an empty board according to its size.
function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

// Return the next player.
function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

// Generate all winning lines dynamically.
function getWinningLines(size) {
  const lines = [];

  // 1. Horizontal winning lines.
  for (let row = 0; row < size; row++) {
    const line = [];

    for (let col = 0; col < size; col++) {
      line.push(row * size + col);
    }

    lines.push(line);
  }

  // 2. Vertical winning lines.
  for (let col = 0; col < size; col++) {
    const line = [];

    for (let row = 0; row < size; row++) {
      line.push(row * size + col);
    }

    lines.push(line);
  }

  // 3. Diagonal: top-left to bottom-right.
  const diagonal1 = [];

  for (let i = 0; i < size; i++) {
    diagonal1.push(i * size + i);
  }

  lines.push(diagonal1);

  // 4. Diagonal: top-right to bottom-left.
  const diagonal2 = [];

  for (let i = 0; i < size; i++) {
    diagonal2.push(i * size + (size - 1 - i));
  }

  lines.push(diagonal2);

  return lines;
}

// Check whether someone has won or the game is a draw.
function getGameResult(board, size) {

  const winningLines = getWinningLines(size);

  // Check for a winner.
  for (const line of winningLines) {
    const firstCell = board[line[0]];

    if (
      firstCell !== null &&
      line.every(index => board[index] === firstCell)
    ) {
      return {
        status: 'win',
        winner: firstCell,
        line: line
      };
    }
  }

  // Check for a draw.
  if (board.every(cell => cell !== null)) {
    return {
      status: 'draw',
      winner: null,
      line: null
    };
  }

  // Game is still running.
  return {
    status: 'playing',
    winner: null,
    line: null
  };
}

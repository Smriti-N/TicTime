// Game rules for TicTime. Pure logic only — no DOM code lives here.

/**
 * Dynamically computes all win lines (rows, columns, diagonals)
 * for an N x N board requiring N-in-a-row to win.
 */
function generateWinLines(size) {
  const lines = [];

  // Rows
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    lines.push(col);
  }

  // Diagonal 1 (\)
  const diag1 = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
  }
  lines.push(diag1);

  // Diagonal 2 (/)
  const diag2 = [];
  for (let i = 0; i < size; i++) {
    diag2.push(i * size + (size - 1 - i));
  }
  lines.push(diag2);

  return lines;
}

/**
 * Creates an empty board of size x size.
 */
function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

/**
 * Rotates turns among the active players array.
 */
function nextPlayer(currentPlayer, playersList = ['X', 'O']) {
  const currentIndex = playersList.indexOf(currentPlayer);
  const nextIndex = (currentIndex + 1) % playersList.length;
  return playersList[nextIndex];
}

/**
 * Checks game status for wins and draws.
 * CRITICAL FIX: Win lines are evaluated BEFORE draw check to prevent
 * move-9 (or board-full) wins from erroneously reporting as draws.
 */
function getGameResult(board, size = 3) {
  const winLines = generateWinLines(size);

  // 1. Evaluate Win Lines First
  for (const line of winLines) {
    const firstCell = board[line[0]];
    if (firstCell && line.every(index => board[index] === firstCell)) {
      return {
        status: 'win',
        winner: firstCell,
        line: line
      };
    }
  }

  // 2. Check for Draw (board completely full with no winner)
  if (board.every(cell => cell !== null)) {
    return {
      status: 'draw',
      winner: null,
      line: null
    };
  }

  // 3. Match Still in Progress
  return {
    status: 'playing',
    winner: null,
    line: null
  };
}
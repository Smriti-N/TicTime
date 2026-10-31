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

/**
 * Board cell index mapping for standard 3x3 board:
 * 
 *  0 | 1 | 2
 * ---+---+---
 *  3 | 4 | 5
 * ---+---+---
 *  6 | 7 | 8
 * 
 * Winning lines represent all 8 possible 3-in-a-row combinations:
 * - 3 horizontal rows: [0, 1, 2], [3, 4, 5], [6, 7, 8]
 * - 3 vertical columns: [0, 3, 6], [1, 4, 7], [2, 5, 8]
 * - 2 diagonals: [0, 4, 8] (main), [2, 4, 6] (anti-diagonal)
 */
const WIN_LINES = getWinLines(3);

/**
 * Creates an empty game board initialized with null values.
 * 
 * @param {number} [size=3] - The width and height of the square board.
 * @returns {Array<null>} An array of length (size * size) filled with null.
 * 
 * @example
 * createEmptyBoard(3); // returns [null, null, null, null, null, null, null, null, null]
 */
function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

/**
 * Returns the opposing player for the next turn.
 * 
 * @param {'X' | 'O'} player - The current player mark ('X' or 'O').
 * @returns {'X' | 'O'} The next player ('O' if player is 'X', otherwise 'X').
 * 
 * @example
 * nextPlayer('X'); // returns 'O'
 * nextPlayer('O'); // returns 'X'
 */
function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Evaluates the current board state and determines if there is a winner, a draw, or if play continues.
 * 
 * @param {Array<string|null>} board - The board array representing the state of each cell.
 * @param {number} [size=3] - The board dimension (e.g. 3 for 3x3).
 * @returns {{status: 'win' | 'draw' | 'playing', winner: string | null, line: Array<number> | null}}
 * The game result object indicating game status, winner ('X', 'O', or null), and the winning line indices (or null).
 * 
 * @example
 * // When player X wins:
 * getGameResult(['X','X','X', null,null,null, null,null,null]);
 * // => { status: 'win', winner: 'X', line: [0, 1, 2] }
 * 
 * // When the board is full with no winner (draw):
 * getGameResult(['X','O','X', 'X','O','O', 'O','X','X']);
 * // => { status: 'draw', winner: null, line: null }
 * 
 * // When the game is still in progress:
 * getGameResult(['X', null, null, null, 'O', null, null, null, null]);
 * // => { status: 'playing', winner: null, line: null }
 */
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

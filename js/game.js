// Game rules for TicTime. No DOM code lives here.
/**
 * Board Index Mapping:
 *
 * The game board is represented as an array of 9 elements.
 * Each index corresponds to one square on the Tic-Tac-Toe board.
 *
 * Board layout:
 *
 *     0 | 1 | 2
 *    ---+---+---
 *     3 | 4 | 5
 *    ---+---+---
 *     6 | 7 | 8
 *
 * WIN_LINES contains all 8 possible winning combinations:
 * - 3 horizontal rows
 * - 3 vertical columns
 * - 2 diagonals
 *
 * A player wins when all three positions in any one
 * winning combination contain the same player's symbol.
 */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
/**
 * Creates a new empty Tic-Tac-Toe board.
 *
 * @returns {Array} An array of 9 empty positions.
 */

function createEmptyBoard() {
  return Array(9).fill(null);
}
/**
 * Determines which player's turn comes next.
 *
 * @param {string} currentPlayer - The current player's symbol (X or O).
 * @returns {string} The symbol of the next player.
 */
function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}
/**
 * Checks the current board to determine the game result.
 *
 * It checks all winning combinations defined in WIN_LINES.
 * If three positions in a winning combination contain the
 * same non-empty symbol, that player wins.
 *
 * It also checks whether the board is full. If there is no
 * winner and the board is full, the result is a draw.
 *
 * @param {Array} board - The current Tic-Tac-Toe board.
 * @returns {*} The result of the game (refer to the actual
 *              return values implemented in this function).
 */
function getGameResult(board) {
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', winner: board[a], line: [a, b, c] };
    }
  }
  return { status: 'playing', winner: null, line: null };
}

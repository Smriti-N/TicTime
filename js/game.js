// Game rules for TicTime. No DOM code lives here.

/**
 * The 8 ways to win tic-tac-toe, expressed as triples of board indexes.
 *
 * The board is a flat array of 9 cells. Indexes map to squares like this:
 *
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 *
 * So [0, 1, 2] is the top row, [0, 3, 6] is the left column,
 * and [0, 4, 8] is the diagonal from top-left to bottom-right.
 */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 7],
];

/**
 * Create a fresh board with all 9 squares empty.
 *
 * @returns {Array<null>} An array of 9 `null` values, one per square.
 */
function createEmptyBoard() {
  return Array(9).fill(null);
}

/**
 * Get the player whose turn comes after the given one.
 *
 * @param {'X'|'O'} player - The player who just moved.
 * @returns {'X'|'O'} The other player.
 */
function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Work out the current state of the game from the board.
 *
 * Win lines are checked BEFORE the full-board draw test, so a winning
 * move on the last empty square is correctly reported as a win.
 *
 * @param {Array<'X'|'O'|null>} board - The 9 squares of the board
 *   (see the index grid above WIN_LINES).
 * @returns {{status: 'win'|'draw'|'playing', winner: 'X'|'O'|null, line: number[]|null}}
 *   An object describing the game state:
 *   - `{ status: 'win', winner: 'X', line: [0, 4, 8] }` — a player has three
 *     in a row; `winner` is 'X' or 'O' and `line` is the winning triple.
 *   - `{ status: 'draw', winner: null, line: null }` — the board is full
 *     with no winner.
 *   - `{ status: 'playing', winner: null, line: null }` — the game is
 *     still going.
 */
function getGameResult(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}
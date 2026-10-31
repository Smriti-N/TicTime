// Game rules for TicTime. No DOM code lives here.

const winLinesCache = {};

// How many marks in a row you need to win on a size x size board.
function getWinLength(size) {
  return size === 3 ? 3 : 4;
}

// Every winning line (as a list of cell indexes) for a size x size board.
function getWinLines(size = 3) {
  if (winLinesCache[size]) return winLinesCache[size];
  const need = getWinLength(size);
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // right, down, diagonals
  const lines = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      for (const [dr, dc] of directions) {
        const endRow = row + dr * (need - 1);
        const endCol = col + dc * (need - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
        const line = [];
        for (let k = 0; k < need; k++) {
          line.push((row + dr * k) * size + (col + dc * k));
        }
        lines.push(line);
      }
    }
  }
  winLinesCache[size] = lines;
  return lines;
}

function createEmptyBoard(size = 3) {
  return Array(size * size).fill(null);
}

function getBoardSize(board) {
  return Math.round(Math.sqrt(board.length));
}

function nextPlayer(player) {
  return player === 'X' ? 'O' : 'X';
}

function getGameResult(board) {
  for (const line of getWinLines(getBoardSize(board))) {
    const first = board[line[0]];
    if (first && line.every((i) => board[i] === first)) {
      return { status: 'win', winner: first, line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw', winner: null, line: null };
  }
  return { status: 'playing', winner: null, line: null };
}

// ---------- Computer opponent ----------

function getEmptyCells(board) {
  const empty = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) empty.push(i);
  }
  return empty;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Returns a cell that wins the game for `player` right now, or -1.
function findWinningMove(board, player) {
  for (const i of getEmptyCells(board)) {
    board[i] = player;
    const won = getGameResult(board).winner === player;
    board[i] = null;
    if (won) return i;
  }
  return -1;
}

// Plays the rest of the game perfectly; used on the 3 x 3 board only.
function minimax(board, player, me, depth) {
  const result = getGameResult(board);
  if (result.status === 'win') return result.winner === me ? 10 - depth : depth - 10;
  if (result.status === 'draw') return 0;
  let best = player === me ? -Infinity : Infinity;
  for (const i of getEmptyCells(board)) {
    board[i] = player;
    const score = minimax(board, nextPlayer(player), me, depth + 1);
    board[i] = null;
    best = player === me ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

// Picks a cell for the computer. Returns -1 if the board is full.
//  - 3 x 3: unbeatable (best you can do is a draw).
//  - 4 x 4 and 5 x 5: takes a win, blocks your win, otherwise centre/random.
function getComputerMove(board, player) {
  const work = board.slice();
  const empty = getEmptyCells(work);
  if (empty.length === 0) return -1;

  if (getBoardSize(work) === 3) {
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const i of empty) {
      work[i] = player;
      const score = minimax(work, nextPlayer(player), player, 1);
      work[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [i];
      } else if (score === bestScore) {
        bestMoves.push(i);
      }
    }
    return pickRandom(bestMoves);
  }

  let move = findWinningMove(work, player);
  if (move >= 0) return move;
  move = findWinningMove(work, nextPlayer(player));
  if (move >= 0) return move;

  const size = getBoardSize(work);
  const centre = [];
  const middle = Math.floor(size / 2);
  for (const i of empty) {
    const row = Math.floor(i / size);
    const col = i % size;
    if (Math.abs(row - middle) <= 1 && Math.abs(col - middle) <= 1) centre.push(i);
  }
  return pickRandom(centre.length ? centre : empty);
}
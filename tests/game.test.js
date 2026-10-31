const { test, describe } = require('node:test');
const assert = require('node:assert');
const { createEmptyBoard, nextPlayer, getGameResult, WIN_LINES } = require('../js/game.js');

describe('Game Rules: createEmptyBoard', () => {
  test('returns an array of 9 null cells', () => {
    const board = createEmptyBoard();
    assert.strictEqual(board.length, 9);
    assert.ok(board.every((cell) => cell === null));
  });
});

describe('Game Rules: nextPlayer', () => {
  test('switches from X to O', () => {
    assert.strictEqual(nextPlayer('X'), 'O');
  });

  test('switches from O to X', () => {
    assert.strictEqual(nextPlayer('O'), 'X');
  });
});

describe('Game Rules: WIN_LINES', () => {
  test('contains all 8 valid winning combinations', () => {
    assert.strictEqual(WIN_LINES.length, 8);
    // Rows
    assert.deepStrictEqual(WIN_LINES[0], [0, 1, 2]);
    assert.deepStrictEqual(WIN_LINES[1], [3, 4, 5]);
    assert.deepStrictEqual(WIN_LINES[2], [6, 7, 8]);
    // Columns
    assert.deepStrictEqual(WIN_LINES[3], [0, 3, 6]);
    assert.deepStrictEqual(WIN_LINES[4], [1, 4, 7]);
    assert.deepStrictEqual(WIN_LINES[5], [2, 5, 8]);
    // Diagonals
    assert.deepStrictEqual(WIN_LINES[6], [0, 4, 8]);
    assert.deepStrictEqual(WIN_LINES[7], [2, 4, 6]);
  });
});

describe('Game Rules: getGameResult', () => {
  test('detects ongoing game on an empty board', () => {
    const board = createEmptyBoard();
    const result = getGameResult(board);
    assert.deepStrictEqual(result, { status: 'playing', winner: null, line: null });
  });

  test('detects ongoing game with incomplete moves', () => {
    const board = [
      'X', 'O', 'X',
      null, 'O', null,
      null, null, null
    ];
    const result = getGameResult(board);
    assert.deepStrictEqual(result, { status: 'playing', winner: null, line: null });
  });

  test('detects horizontal win for X on top row', () => {
    const board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 1, 2]);
  });

  test('detects horizontal win for O on middle row', () => {
    const board = [
      'X', 'X', null,
      'O', 'O', 'O',
      'X', null, null
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'O');
    assert.deepStrictEqual(result.line, [3, 4, 5]);
  });

  test('detects vertical win for O on first column', () => {
    const board = [
      'O', 'X', 'X',
      'O', 'X', null,
      'O', null, null
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'O');
    assert.deepStrictEqual(result.line, [0, 3, 6]);
  });

  test('detects main diagonal win for X (top-left to bottom-right)', () => {
    const board = [
      'X', 'O', null,
      'O', 'X', null,
      null, null, 'X'
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 4, 8]);
  });

  test('detects anti-diagonal win for O (top-right to bottom-left)', () => {
    const board = [
      'X', 'X', 'O',
      null, 'O', null,
      'O', null, 'X'
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'O');
    assert.deepStrictEqual(result.line, [2, 4, 6]);
  });

  test('detects a win on the 9th move (board full)', () => {
    // Board is completely full, but X has completed a winning row
    const board = [
      'X', 'X', 'X',
      'O', 'O', 'X',
      'X', 'O', 'O'
    ];
    const result = getGameResult(board);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 1, 2]);
  });

  test('detects a draw when the board is full with no winner', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ];
    const result = getGameResult(board);
    assert.deepStrictEqual(result, { status: 'draw', winner: null, line: null });
  });
});


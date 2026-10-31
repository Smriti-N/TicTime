const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  createEmptyBoard,
  nextPlayer,
  getGameResult,
  getWinLines,
  WIN_LINES,
  getCellCoordinates,
} = require('../js/game.js');

describe('Game Rules (js/game.js)', () => {
  test('createEmptyBoard initializes an empty board filled with null', () => {
    const board3 = createEmptyBoard(3);
    assert.strictEqual(board3.length, 9);
    assert.ok(board3.every((cell) => cell === null));

    const board4 = createEmptyBoard(4);
    assert.strictEqual(board4.length, 16);
    assert.ok(board4.every((cell) => cell === null));
  });

  test('nextPlayer correctly toggles between X and O', () => {
    assert.strictEqual(nextPlayer('X'), 'O');
    assert.strictEqual(nextPlayer('O'), 'X');
  });

  test('getWinLines returns 8 winning lines for 3x3 board', () => {
    assert.strictEqual(WIN_LINES.length, 8);
    // Rows
    assert.deepStrictEqual(WIN_LINES[0], [0, 1, 2]);
    assert.deepStrictEqual(WIN_LINES[1], [3, 4, 5]);
    assert.deepStrictEqual(WIN_LINES[2], [6, 7, 8]);
    // Columns
    assert.deepStrictEqual(WIN_LINES[3], [0, 3, 6]);
    assert.deepStrictEqual(WIN_LINES[4], [1, 4, 7]);
    assert.deepStrictEqual(WIN_LINES[5], [2, 5, 8]);
    // Main diagonal
    assert.deepStrictEqual(WIN_LINES[6], [0, 4, 8]);
    // Anti-diagonal
    assert.deepStrictEqual(WIN_LINES[7], [2, 4, 6]);
  });

  test('getGameResult detects a row win', () => {
    const board = [
      'X', 'X', 'X',
      'O', 'O', null,
      null, null, null,
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 1, 2]);
  });

  test('getGameResult detects a column win', () => {
    const board = [
      'O', 'X', null,
      'O', 'X', null,
      'O', null, null,
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'O');
    assert.deepStrictEqual(result.line, [0, 3, 6]);
  });

  test('getGameResult detects a main diagonal win (\)', () => {
    const board = [
      'X', 'O', null,
      'O', 'X', null,
      null, null, 'X',
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 4, 8]);
  });

  test('getGameResult detects an anti-diagonal win (/)', () => {
    const board = [
      'O', 'X', 'O',
      'X', 'O', null,
      'O', null, 'X',
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'O');
    assert.deepStrictEqual(result.line, [2, 4, 6]);
  });

  test('getGameResult detects a draw when the board is full with no winner', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'draw');
    assert.strictEqual(result.winner, null);
    assert.strictEqual(result.line, null);
  });

  test('getGameResult returns playing when game is still in progress', () => {
    const board = [
      'X', null, null,
      null, 'O', null,
      null, null, null,
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'playing');
    assert.strictEqual(result.winner, null);
    assert.strictEqual(result.line, null);
  });

  test('getGameResult recognizes a win on the 9th move rather than reporting draw', () => {
    // 1-5-9 diagonal win on 9th move:
    // X O X
    // O X O
    // O X X
    const board = [
      'X', 'O', 'X',
      'O', 'X', 'O',
      'O', 'X', 'X',
    ];
    const result = getGameResult(board, 3);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 4, 8]);
  });

  test('getCellCoordinates computes 1-based row and column coordinates', () => {
    assert.deepStrictEqual(getCellCoordinates(0, 3), { row: 1, col: 1 });
    assert.deepStrictEqual(getCellCoordinates(4, 3), { row: 2, col: 2 });
    assert.deepStrictEqual(getCellCoordinates(8, 3), { row: 3, col: 3 });
  });

  test('4x4 board requires 4 in a row to win', () => {
    const board4 = createEmptyBoard(4);
    board4[0] = 'X';
    board4[1] = 'X';
    board4[2] = 'X';
    assert.strictEqual(getGameResult(board4, 4).status, 'playing');

    board4[3] = 'X';
    const result = getGameResult(board4, 4);
    assert.strictEqual(result.status, 'win');
    assert.strictEqual(result.winner, 'X');
    assert.deepStrictEqual(result.line, [0, 1, 2, 3]);
  });
});

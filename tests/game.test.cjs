const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createEmptyBoard, nextPlayer, getGameResult } = require('../js/game.js');

for (const [name, line] of [
  ['top row', [0, 1, 2]], ['middle row', [3, 4, 5]], ['bottom row', [6, 7, 8]],
  ['left column', [0, 3, 6]], ['middle column', [1, 4, 7]], ['right column', [2, 5, 8]],
  ['main diagonal', [0, 4, 8]], ['opposite diagonal', [2, 4, 6]],
]) {
  test(`${name} wins for either player`, () => {
    for (const player of ['X', 'O']) {
      const board = createEmptyBoard();
      line.forEach(index => { board[index] = player; });
      assert.deepEqual(getGameResult(board), { status: 'win', winner: player, line });
    }
  });
}

test('full board without a line is a draw', () => {
  assert.deepEqual(getGameResult(['X','O','X','X','O','O','O','X','X']), { status: 'draw', winner: null, line: null });
});

test('incomplete game stays in progress without mutating its board', () => {
  const board = ['X','O',null,null,'X',null,null,null,null];
  const before = board.slice();
  assert.deepEqual(getGameResult(board), { status: 'playing', winner: null, line: null });
  assert.deepEqual(board, before);
});

test('nextPlayer alternates X and O', () => {
  assert.equal(nextPlayer('X'), 'O');
  assert.equal(nextPlayer('O'), 'X');
});

test('empty boards contain nine nulls and are independent', () => {
  const first = createEmptyBoard();
  assert.deepEqual(first, Array(9).fill(null));
  first[0] = 'X';
  assert.deepEqual(createEmptyBoard(), Array(9).fill(null));
  assert.equal(getGameResult(createEmptyBoard()).status, 'playing');
});

test('a ninth-move win takes priority over a draw', () => {
  assert.deepEqual(getGameResult(['X','O','O','O','X','X','X','O','X']), {
    status: 'win', winner: 'X', line: [0,4,8],
  });
});

test('the former false diagonal is not a win', () => {
  assert.equal(getGameResult(['O','O','X',null,'X',null,null,'X',null]).status, 'playing');
});

test('game rules also load as a plain browser script without module', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../js/game.js'), 'utf8'), context);
  assert.equal(vm.runInContext('createEmptyBoard().length', context), 9);
  assert.equal(vm.runInContext("nextPlayer('X')", context), 'O');
  assert.equal(vm.runInContext('getGameResult(createEmptyBoard()).status', context), 'playing');
});

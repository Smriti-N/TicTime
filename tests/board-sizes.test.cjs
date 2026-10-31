const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8'), context);
function result(board) { context.position = board; return vm.runInContext('getGameResult(position)', context); }

for (const [size, lines] of [
  [3, [[0,1,2], [0,3,6], [0,4,8], [2,4,6]]],
  [4, [[12,13,14,15], [2,6,10,14], [0,5,10,15], [3,6,9,12]]],
  [5, [[21,22,23,24], [4,9,14,19], [1,7,13,19], [9,13,17,21], [5,11,17,23]]],
]) {
  test(`${size}x${size}: wins in every direction including edge and offset lines`, () => {
    context.size = size;
    assert.equal(vm.runInContext('createEmptyBoard(size).length', context), size * size);
    for (const player of ['X', 'O']) for (const line of lines) {
      const board = Array(size * size).fill(null);
      line.forEach(index => { board[index] = player; });
      assert.equal(result(board).status, 'win');
      assert.equal(result(board).winner, player);
      assert.deepEqual(Array.from(result(board).line), line);
      board[line.at(-1)] = null;
      assert.equal(result(board).status, 'playing');
    }
  });
}

test('rows do not wrap and a gap does not count as consecutive', () => {
  for (const line of [[3,4,5,6], [0,1,3,4]]) {
    const board = Array(25).fill(null); line.forEach(i => { board[i] = 'X'; });
    assert.equal(result(board).status, 'playing');
  }
});

test('full boards distinguish wins from genuine draws at each size', () => {
  for (const rows of [
    ['XOX', 'XOO', 'OXX'],
    ['XXOO', 'OOXX', 'XXOO', 'OOXX'],
    ['XXOOX', 'OOXXO', 'XXOOX', 'OOXXO', 'XXOOX'],
  ]) {
    const board = rows.join('').split('');
    assert.equal(result(board).status, 'draw');
    for (let i = 0; i < (rows.length === 3 ? 3 : 4); i++) board[i] = 'X';
    assert.equal(result(board).status, 'win');
  }
});

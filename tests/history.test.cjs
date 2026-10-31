const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function setup() {
  const elements = new Map();
  const context = vm.createContext({
    document: { getElementById(id) {
      if (!elements.has(id)) elements.set(id, { listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; } });
      return elements.get(id);
    } },
    buildBoard() {}, renderBoard() {}, renderScores() {}, launchConfetti() {}, setTheme() {},
    highlightWinningCells() {}, clearWinningCells() {},
    setStatus(text) { context.status = text; },
    setBoardLocked(value) { context.locked = value; },
    renderHistory(entries, move) { context.entries = entries; context.move = move; },
  });
  for (const file of ['game.js', 'main.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context);
  }
  return { context, elements, run: (code) => vm.runInContext(code, context) };
}

test('history records independent snapshots and branching discards the future', () => {
  const app = setup();
  app.run('[0,3,1].forEach(handleCellClick); jumpToMove(1)');
  assert.equal(app.context.move, 1);
  assert.equal(app.run('state.board[3]'), null);
  assert.equal(app.run('state.currentPlayer'), 'O');
  assert.equal(app.context.entries.length, 4);
  app.run('handleCellClick(8)');
  assert.equal(app.context.entries.length, 3);
  assert.equal(app.context.entries[2].player, 'O');
  assert.equal(app.context.entries[2].square, 8);
  assert.equal(app.context.entries[1].board[8], null);
  app.run('handleCellClick(8)');
  assert.equal(app.context.entries.length, 3);
});

test('jumping across a win restores game state and avoids duplicate score awards', () => {
  const app = setup();
  app.run('[0,3,1,4,2].forEach(handleCellClick)');
  assert.equal(app.run('state.scores.X'), 1);
  app.run('jumpToMove(4)');
  assert.equal(app.context.locked, false);
  assert.equal(app.run('state.scores.X'), 0);
  assert.equal(app.context.status, "Player X's turn");
  app.run('jumpToMove(5); jumpToMove(5)');
  assert.equal(app.run('state.scores.X'), 1);
  assert.equal(app.context.status, 'Player X wins!');
  app.run('jumpToMove(4); handleCellClick(2)');
  assert.equal(app.run('state.scores.X'), 1);
});

test('Undo restores the previous move and New Game resets the list', () => {
  const app = setup();
  app.run('handleCellClick(4)');
  app.elements.get('undo-btn').listeners.click();
  assert.equal(app.context.move, 0);
  assert.equal(app.run('state.board.every(cell => cell === null)'), true);
  app.run('startNewGame()');
  assert.equal(app.context.entries.length, 1);
  assert.equal(app.context.move, 0);
  assert.equal(app.context.status, "Player X's turn");
});

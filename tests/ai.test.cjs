const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function setup() {
  const elements = new Map();
  const timers = new Map();
  let timerId = 0;
  const context = vm.createContext({
    document: { getElementById(id) {
      if (!elements.has(id)) elements.set(id, { listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; } });
      return elements.get(id);
    } },
    setTimeout(callback, delay) { assert.equal(delay, 500); timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    buildBoard() {}, renderBoard() {}, highlightWinningCells() {}, launchConfetti() {},
    renderScores(scores) { context.displayScores = { ...scores }; },
    setStatus(text) { context.status = text; },
    setBoardLocked(locked) { context.locked = locked; },
    setTheme(theme) { context.theme = theme; },
  });
  for (const file of ['game.js', 'ai.js', 'main.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context);
  }
  return { context, elements, timers, run: (code) => vm.runInContext(code, context),
    reply() { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); } };
}

test('computer cannot lose against any legal human continuation', () => {
  const { context, run } = setup();
  let endings = 0;
  function visit(board, player) {
    context.position = board;
    const result = run('getGameResult(position)');
    if (result.status !== 'playing') {
      assert.notEqual(result.winner, 'X');
      endings++;
      return;
    }
    if (player === 'O') {
      const before = board.slice();
      const move = run('getComputerMove(position)');
      assert.deepEqual(board, before);
      assert.equal(board[move], null);
      const next = board.slice(); next[move] = 'O'; visit(next, 'X');
    } else {
      board.forEach((value, index) => {
        if (value !== null) return;
        const next = board.slice(); next[index] = 'X'; visit(next, 'O');
      });
    }
  }
  visit(Array(9).fill(null), 'X');
  assert.ok(endings > 0);
});

test('computer turn blocks input and replies once after the delay', () => {
  const app = setup();
  app.elements.get('mode-select').listeners.change({ target: { value: 'computer' } });
  app.run('handleCellClick(0); handleCellClick(1)');
  assert.equal(app.run('state.board[1]'), null);
  assert.equal(app.context.locked, true);
  assert.equal(app.timers.size, 1);
  app.reply();
  assert.equal(app.run("state.board.filter(mark => mark === 'O').length"), 1);
  assert.equal(app.run('state.currentPlayer'), 'X');
  assert.equal(app.context.locked, false);
});

test('New Game and mode changes cancel pending replies and preserve scores', () => {
  const app = setup();
  app.run("state.mode='computer'; state.scores.X=2; handleCellClick(0); startNewGame()");
  assert.equal(app.timers.size, 0);
  assert.equal(app.run('state.board.every(cell => cell === null)'), true);
  assert.equal(app.context.status, "Player X's turn");
  assert.equal(app.run('state.scores.X'), 2);
  app.run('handleCellClick(0)');
  app.elements.get('mode-select').listeners.change({ target: { value: 'human' } });
  assert.equal(app.timers.size, 0);
  app.run('handleCellClick(0); handleCellClick(1); toggleTheme()');
  assert.equal(app.run('state.board[1]'), 'O');
  assert.equal(app.context.theme, 'dark');
});

test('wins, draws and game-over input still work', () => {
  const app = setup();
  app.run('[0,3,1,4,2].forEach(handleCellClick)');
  assert.equal(app.context.status, 'Player X wins!');
  assert.equal(app.context.displayScores.X, 1);
  app.run('startNewGame(); [0,1,2,4,3,5,7,6,8].forEach(handleCellClick); handleCellClick(0)');
  assert.equal(app.context.status, "It's a draw!");
  assert.deepEqual(app.context.displayScores, { X: 1, O: 0, draws: 1 });
});

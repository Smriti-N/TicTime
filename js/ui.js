// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const hintEl = document.getElementById('win-hint');
const moveListEl = document.getElementById('move-list');
const historyEmptyEl = document.getElementById('history-empty');
let cellEls = [];
let gridSize = 3;

const MARKS = {
  X: '<svg class="mark" viewBox="0 0 100 100"><path pathLength="100" d="M26 26L74 74"/><path pathLength="100" d="M74 26L26 74"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100"><circle pathLength="100" cx="50" cy="50" r="26"/></svg>',
};

// Screen-reader text for a cell, e.g. "Row 2, column 3, X".
function cellLabel(index, value) {
  const row = Math.floor(index / gridSize) + 1;
  const col = (index % gridSize) + 1;
  return 'Row ' + row + ', column ' + col + ', ' + (value || 'empty');
}

function buildBoard(onCellClick, size = 3) {
  gridSize = size;
  boardEl.innerHTML = '';
  boardEl.dataset.size = size;
  boardEl.style.setProperty('--size', size);
  cellEls = [];
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('aria-label', cellLabel(i, null));
    cell.addEventListener('click', () => onCellClick(i));
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

// Arrow keys move between cells (Enter / Space place a mark, like a normal button).
boardEl.addEventListener('keydown', (event) => {
  const current = cellEls.indexOf(document.activeElement);
  if (current === -1) return;
  let row = Math.floor(current / gridSize);
  let col = current % gridSize;
  if (event.key === 'ArrowUp') row--;
  else if (event.key === 'ArrowDown') row++;
  else if (event.key === 'ArrowLeft') col--;
  else if (event.key === 'ArrowRight') col++;
  else return;
  event.preventDefault();
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;
  cellEls[row * gridSize + col].focus();
});

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    if ((cell.dataset.mark || '') === (value || '')) return;
    if (value) {
      cell.dataset.mark = value;
    } else {
      delete cell.dataset.mark;
    }
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
    cell.innerHTML = value ? MARKS[value] : '';
    cell.setAttribute('aria-label', cellLabel(i, value));
  });
}

function highlightWinningCells(line) {
  for (let i = 0; i < line.length; i++) {
    cellEls[line[i]].classList.add('win');
  }
}

function clearHighlight() {
  cellEls.forEach((cell) => cell.classList.remove('win'));
}

function setStatus(text, player) {
  statusTextEl.textContent = text;
  statusEl.dataset.player = player || '';
  boardEl.dataset.turn = player || '';
}

function setHint(text) {
  hintEl.textContent = text;
}

function setBoardLocked(locked) {
  boardEl.classList.toggle('is-over', locked);
}

function renderScores(scores) {
  document.getElementById('score-x').textContent = scores.X;
  document.getElementById('score-o').textContent = scores.O;
  document.getElementById('score-draws').textContent = scores.draws;
}

function setPlayerLabels(xName, oName) {
  document.querySelector('.score-card.x .score-label').textContent = xName;
  document.querySelector('.score-card.o .score-label').textContent = oName;
}

// Draws the move list. moves = [{ player, index }], viewIndex = how many moves are shown.
function renderHistory(moves, viewIndex, onSelect) {
  const hadFocus = moveListEl.contains(document.activeElement);
  moveListEl.innerHTML = '';
  historyEmptyEl.hidden = moves.length > 0;
  moveListEl.hidden = moves.length === 0;
  if (moves.length === 0) return;

  let activeButton = null;
  for (let step = 0; step <= moves.length; step++) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'move-btn' + (step === viewIndex ? ' active' : '');
    if (step === viewIndex) {
      button.setAttribute('aria-current', 'step');
      activeButton = button;
    }
    if (step === 0) {
      button.textContent = 'Game start';
    } else {
      const move = moves[step - 1];
      const row = Math.floor(move.index / gridSize) + 1;
      const col = (move.index % gridSize) + 1;
      const mark = document.createElement('span');
      mark.className = 'move-mark ' + move.player.toLowerCase();
      mark.textContent = move.player;
      button.appendChild(mark);
      button.appendChild(document.createTextNode('Move ' + step + ' · row ' + row + ', col ' + col));
    }
    button.addEventListener('click', () => onSelect(step));
    item.appendChild(button);
    moveListEl.appendChild(item);
  }
  if (viewIndex === moves.length) moveListEl.scrollTop = moveListEl.scrollHeight;
  if (hadFocus && activeButton) activeButton.focus();
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ff5f6d', '#ffc371', '#36d1dc', '#5b86e5', '#a78bfa'];
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    piece.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2400);
  }
}
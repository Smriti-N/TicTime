// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
let cellEls = [];

const MARKS = {
  X: '<svg class="mark" viewBox="0 0 100 100"><path pathLength="100" d="M26 26L74 74"/><path pathLength="100" d="M74 26L26 74"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100"><circle pathLength="100" cx="50" cy="50" r="26"/></svg>',
};

function buildBoard(onCellClick) {
  boardEl.innerHTML = '';
  cellEls = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.tabIndex = i === 0 ? 0 : -1;
    cell.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${i % 3 + 1}, empty`);
    cell.addEventListener('focus', () => {
      cellEls.forEach((item) => { item.tabIndex = item === cell ? 0 : -1; });
    });
    cell.addEventListener('keydown', (event) => {
      const row = Math.floor(i / 3);
      const column = i % 3;
      const targets = {
        ArrowLeft: row * 3 + Math.max(0, column - 1),
        ArrowRight: row * 3 + Math.min(2, column + 1),
        ArrowUp: Math.max(0, row - 1) * 3 + column,
        ArrowDown: Math.min(2, row + 1) * 3 + column,
        Home: row * 3,
        End: row * 3 + 2,
      };
      if (Object.hasOwn(targets, event.key)) {
        event.preventDefault();
        cellEls[targets[event.key]].focus();
      }
    });
    cell.addEventListener('click', () => {
      if (cell.getAttribute('aria-disabled') !== 'true') onCellClick(i);
    });
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    cell.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${i % 3 + 1}, ${value || 'empty'}`);
    cell.setAttribute('aria-disabled', String(Boolean(value) || boardEl.classList.contains('is-over')));
    if ((cell.dataset.mark || '') === (value || '')) return;
    cell.dataset.mark = value || '';
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
    cell.innerHTML = value ? MARKS[value] : '';
    cell.querySelector('svg')?.setAttribute('aria-hidden', 'true');
  });
}

function highlightWinningCells(line) {
  for (let i = 0; i < line.length - 1; i++) {
    cellEls[line[i]].classList.add('win');
  }
}

function setStatus(text, player) {
  statusTextEl.textContent = text;
  statusEl.dataset.player = player || '';
  boardEl.dataset.turn = player || '';
}

function setBoardLocked(locked) {
  boardEl.classList.toggle('is-over', locked);
  cellEls.forEach((cell) => {
    cell.setAttribute('aria-disabled', String(locked || Boolean(cell.dataset.mark)));
  });
}

function renderScores(scores) {
  document.getElementById('score-x').textContent = scores.X;
  document.getElementById('score-o').textContent = scores.O;
  document.getElementById('score-draws').textContent = scores.draws;
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

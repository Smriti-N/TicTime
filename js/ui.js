// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const historyListEl = document.getElementById('move-history');
const historyEmptyEl = document.getElementById('history-empty');
let cellEls = [];

const MARKS = {
  X: '<svg class="mark" viewBox="0 0 100 100"><path pathLength="100" d="M26 26L74 74"/><path pathLength="100" d="M74 26L26 74"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100"><circle pathLength="100" cx="50" cy="50" r="26"/></svg>',
};

function buildBoard(onCellClick) {
  boardEl.innerHTML = '';
  cellEls = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => onCellClick(i));
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    cell.classList.remove('win');
    if ((cell.dataset.mark || '') === (value || '')) return;
    cell.dataset.mark = value || '';
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
    cell.innerHTML = value ? MARKS[value] : '';
  });
}

function renderHistory(history, currentIndex, onSelect) {
  historyListEl.replaceChildren();
  historyEmptyEl.hidden = history.length > 0;

  history.forEach((move, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-move';
    button.textContent = `${index + 1}. ${move.player} -> square ${move.square + 1}`;

    if (index + 1 === currentIndex) {
      button.classList.add('is-current');
      button.setAttribute('aria-current', 'step');
    }

    button.addEventListener('click', () => onSelect(index));
    item.appendChild(button);
    historyListEl.appendChild(item);
  });
}

function highlightWinningCells(line) {
  for (let i = 0; i < line.length; i++) {
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

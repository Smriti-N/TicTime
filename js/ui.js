// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
let cellEls = [];

const CELL_POSITIONS = [
  'Top Left (Row 1, Column 1)',
  'Top Center (Row 1, Column 2)',
  'Top Right (Row 1, Column 3)',
  'Middle Left (Row 2, Column 1)',
  'Center (Row 2, Column 2)',
  'Middle Right (Row 2, Column 3)',
  'Bottom Left (Row 3, Column 1)',
  'Bottom Center (Row 3, Column 2)',
  'Bottom Right (Row 3, Column 3)'
];

const MARKS = {
  X: '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><path pathLength="100" d="M26 26L74 74"/><path pathLength="100" d="M74 26L26 74"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="100" cx="50" cy="50" r="26"/></svg>',
};

function announce(message) {
  const srEl = document.getElementById('sr-announcements');
  if (!srEl) return;
  srEl.textContent = '';
  setTimeout(() => {
    srEl.textContent = message;
  }, 40);
}

function handleGridNavigation(e, index) {
  let targetIndex = null;
  const row = Math.floor(index / 3);

  switch (e.key) {
    case 'ArrowRight':
      targetIndex = index < 8 ? index + 1 : 0;
      break;
    case 'ArrowLeft':
      targetIndex = index > 0 ? index - 1 : 8;
      break;
    case 'ArrowDown':
      targetIndex = index + 3 <= 8 ? index + 3 : (index % 3);
      break;
    case 'ArrowUp':
      targetIndex = index - 3 >= 0 ? index - 3 : (6 + (index % 3));
      break;
    case 'Home':
      targetIndex = row * 3;
      break;
    case 'End':
      targetIndex = row * 3 + 2;
      break;
    default:
      return;
  }

  e.preventDefault();
  cellEls.forEach((c) => (c.tabIndex = -1));
  cellEls[targetIndex].tabIndex = 0;
  cellEls[targetIndex].focus();
}

function buildBoard(onCellClick) {
  boardEl.innerHTML = '';
  cellEls = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `${CELL_POSITIONS[i]}, empty`);
    cell.tabIndex = i === 0 ? 0 : -1; // Roving tabindex

    cell.addEventListener('click', () => onCellClick(i));
    cell.addEventListener('keydown', (e) => handleGridNavigation(e, i));

    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    if ((cell.dataset.mark || '') === (value || '')) return;
    cell.dataset.mark = value || '';
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
    cell.innerHTML = value ? MARKS[value] : '';
    if (value) {
      cell.setAttribute('aria-label', `${CELL_POSITIONS[i]}, marked ${value}`);
      cell.setAttribute('aria-disabled', 'true');
    } else {
      cell.setAttribute('aria-label', `${CELL_POSITIONS[i]}, empty`);
      cell.removeAttribute('aria-disabled');
    }
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
    if (locked) {
      cell.setAttribute('aria-disabled', 'true');
    } else if (!cell.dataset.mark) {
      cell.removeAttribute('aria-disabled');
    }
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

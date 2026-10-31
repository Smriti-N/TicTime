// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
let cellEls = [];
let activeCellIndex = 0;

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
    cell.setAttribute('role', 'button');
    cell.tabIndex = i === activeCellIndex ? 0 : -1;
    cell.addEventListener('click', () => {
      activeCellIndex = i;
      updateRovingTabindex();
      cell.focus();
      onCellClick(i);
    });
    cell.addEventListener('keydown', (event) => handleCellKeydown(event, i));
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
  renderBoard(Array(9).fill(null));
}

function updateRovingTabindex() {
  cellEls.forEach((cell, i) => {
    cell.tabIndex = i === activeCellIndex ? 0 : -1;
  });
}

function handleCellKeydown(event, index) {
  const row = Math.floor(index / 3);
  const column = index % 3;
  let nextIndex;

  switch (event.key) {
    case 'ArrowUp':
      nextIndex = ((row + 2) % 3) * 3 + column;
      break;
    case 'ArrowDown':
      nextIndex = ((row + 1) % 3) * 3 + column;
      break;
    case 'ArrowLeft':
      nextIndex = row * 3 + (column + 2) % 3;
      break;
    case 'ArrowRight':
      nextIndex = row * 3 + (column + 1) % 3;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (cellEls[index].getAttribute('aria-disabled') !== 'true') {
        cellEls[index].click();
      }
      return;
    default:
      return;
  }

  event.preventDefault();
  activeCellIndex = nextIndex;
  updateRovingTabindex();
  cellEls[nextIndex].focus();
}

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    const previousMark = cell.dataset.mark || '';
    const nextMark = value || '';
    const row = Math.floor(i / 3) + 1;
    const column = (i % 3) + 1;
    cell.setAttribute('aria-label', `Row ${row}, column ${column}, ${nextMark || 'empty'}`);
    cell.setAttribute('aria-disabled', nextMark || boardEl.classList.contains('is-over') ? 'true' : 'false');
    cell.dataset.mark = nextMark;
    if (previousMark === nextMark) return;
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
    cell.innerHTML = value ? MARKS[value] : '';
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
  cellEls.forEach((cell) => {
    const occupied = Boolean(cell.dataset.mark);
    cell.setAttribute('aria-disabled', occupied || locked ? 'true' : 'false');
  });
}

function renderScores(scores) {
  document.getElementById('score-x').textContent = scores.X;
  document.getElementById('score-o').textContent = scores.O;
  document.getElementById('score-draws').textContent = scores.draws;
}

function setGameMode(mode) {
  document.getElementById('score-o-label').textContent = mode === 'computer' ? 'Computer' : 'Player O';
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

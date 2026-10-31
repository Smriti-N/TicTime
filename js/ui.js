// Everything that touches the page (DOM) lives here.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const historyListEl = document.getElementById('history-list');
const historyEmptyEl = document.getElementById('history-empty');
const historyCountEl = document.getElementById('history-count');
const historyFooterEl = document.getElementById('history-footer');
const undoBtn = document.getElementById('undo-btn');
let cellEls = [];

const MARKS = {
  X: '<svg class="mark" viewBox="0 0 100 100"><path pathLength="100" d="M26 26L74 74"/><path pathLength="100" d="M74 26L26 74"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100"><circle pathLength="100" cx="50" cy="50" r="26"/></svg>',
};

function buildBoard(size = 3, onCellClick) {
  boardEl.innerHTML = '';
  boardEl.dataset.size = size;
  boardEl.style.setProperty('--board-size', size);
  boardEl.setAttribute('role', 'grid');
  boardEl.setAttribute('aria-label', `${size} by ${size} Tic-Tac-Toe Board`);
  cellEls = [];

  const totalCells = size * size;
  for (let i = 0; i < totalCells; i++) {
    const coords = getCellCoordinates(i, size);
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', i === 0 ? '0' : '-1');
    cell.setAttribute('aria-label', `Row ${coords.row}, Column ${coords.col}, empty`);

    cell.addEventListener('click', () => onCellClick(i));

    cell.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCellClick(i);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (i - size + totalCells) % totalCells;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (i + size) % totalCells;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIndex = i % size === 0 ? i + (size - 1) : i - 1;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        targetIndex = (i + 1) % size === 0 ? i - (size - 1) : i + 1;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = totalCells - 1;
      }

      if (targetIndex !== null && cellEls[targetIndex]) {
        cell.setAttribute('tabindex', '-1');
        cellEls[targetIndex].setAttribute('tabindex', '0');
        cellEls[targetIndex].focus();
      }
    });

    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function renderBoard(board) {
  const size = parseInt(boardEl.dataset.size || '3', 10);
  board.forEach((value, i) => {
    const cell = cellEls[i];
    if (!cell) return;
    const currentMark = cell.dataset.mark || '';
    const newMark = value || '';
    if (currentMark !== newMark) {
      cell.dataset.mark = newMark;
      cell.innerHTML = value ? MARKS[value] : '';
    }
    const coords = getCellCoordinates(i, size);
    const markDesc = value ? value : 'empty';
    cell.setAttribute('aria-label', `Row ${coords.row}, Column ${coords.col}, ${markDesc}`);
    cell.className = 'cell' + (value ? ' filled ' + value.toLowerCase() : '');
  });
}

function highlightWinningCells(line) {
  clearWinningHighlight();
  if (!line) return;
  for (let i = 0; i < line.length; i++) {
    if (cellEls[line[i]]) {
      cellEls[line[i]].classList.add('win');
    }
  }
}

function clearWinningHighlight() {
  cellEls.forEach((cell) => cell.classList.remove('win'));
}

function highlightLastMove(index) {
  cellEls.forEach((cell, i) => {
    cell.classList.toggle('last-move', i === index);
  });
}

function renderHistory(history, viewingStep, onStepClick) {
  if (!historyListEl || !historyEmptyEl || !historyCountEl) return;

  const totalMoves = history.length;
  historyCountEl.textContent = `${totalMoves} ${totalMoves === 1 ? 'move' : 'moves'}`;

  if (totalMoves === 0) {
    historyEmptyEl.style.display = 'flex';
    historyListEl.style.display = 'none';
    historyListEl.innerHTML = '';
    if (historyFooterEl) historyFooterEl.style.display = 'none';
    return;
  }

  historyEmptyEl.style.display = 'none';
  historyListEl.style.display = 'flex';
  historyListEl.innerHTML = '';

  // 1. "Game start" entry (Step 0)
  const isStartActive = viewingStep === 0;
  const startLi = document.createElement('li');
  startLi.className = 'history-item';

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.className = 'history-item-btn' + (isStartActive ? ' is-active' : '');
  startBtn.setAttribute('aria-label', 'Jump to game start (empty board)');
  startBtn.innerHTML = `
    <span class="history-step-num">#0</span>
    <span class="history-badge start" aria-hidden="true">🏁</span>
    <div class="history-move-info">
      <span class="history-move-title">Game start</span>
      <span class="history-move-desc">Empty board</span>
    </div>
    ${isStartActive ? '<span class="history-viewing-tag">Viewing</span>' : ''}
  `;
  startBtn.addEventListener('click', () => onStepClick(0));
  startLi.appendChild(startBtn);
  historyListEl.appendChild(startLi);

  // 2. Each move entry (Step 1..N)
  history.forEach((m) => {
    const isStepActive = viewingStep === m.step || (viewingStep === null && m.step === totalMoves);
    const li = document.createElement('li');
    li.className = 'history-item';

    let tagHtml = '';
    if (m.status === 'win') {
      tagHtml = '<span class="history-tag win">🏆 Winner</span>';
    } else if (m.status === 'draw') {
      tagHtml = '<span class="history-tag draw">Draw</span>';
    } else if (isStepActive && viewingStep !== null && viewingStep < totalMoves) {
      tagHtml = '<span class="history-viewing-tag">Viewing</span>';
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'history-item-btn' + (isStepActive ? ' is-active' : '');
    btn.setAttribute('aria-label', `Jump to move ${m.step}: ${m.player} to square ${m.index + 1} (Row ${m.row}, Column ${m.col})`);
    btn.innerHTML = `
      <span class="history-step-num">#${m.step}</span>
      <span class="history-badge ${m.player.toLowerCase()}">${m.player}</span>
      <div class="history-move-info">
        <span class="history-move-title">${m.player} &rarr; square ${m.index + 1}</span>
        <span class="history-move-desc">Row ${m.row}, Col ${m.col}</span>
      </div>
      ${tagHtml}
    `;
    btn.addEventListener('click', () => onStepClick(m.step));
    li.appendChild(btn);
    historyListEl.appendChild(li);
  });

  if (historyFooterEl) {
    const isViewingPast = viewingStep !== null && viewingStep < totalMoves;
    historyFooterEl.style.display = isViewingPast ? 'block' : 'none';
  }

  if (undoBtn) {
    undoBtn.disabled = totalMoves === 0;
  }

  const activeBtn = historyListEl.querySelector('.history-item-btn.is-active');
  if (activeBtn) {
    activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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

function setAiThinking(thinking) {
  boardEl.classList.toggle('is-thinking', thinking);
  if (undoBtn && thinking) {
    undoBtn.disabled = true;
  }
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

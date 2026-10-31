// Drawing, DOM manipulation, theme handling, confetti, and Thanos Snap physics.

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('status-text');
const scoreboardEl = document.getElementById('scoreboard');
const movesListEl = document.getElementById('moves-list');
const matchesListEl = document.getElementById('matches-list');
const timerDisplayEl = document.getElementById('timer-display');
const taglineEl = document.getElementById('tagline');

let cellEls = [];

const MARK_SVGS = {
  X: '<svg class="mark" viewBox="0 0 100 100"><path stroke="url(#grad-x)" stroke-width="14" stroke-linecap="round" d="M24 24 L76 76 M76 24 L24 76"/></svg>',
  O: '<svg class="mark" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" stroke="url(#grad-o)" stroke-width="14" fill="none"/></svg>',
  TRIANGLE: '<svg class="mark" viewBox="0 0 100 100"><polygon points="50,20 82,78 18,78" stroke="url(#grad-tri)" stroke-width="12" fill="none" stroke-linejoin="round"/></svg>',
  SQUARE: '<svg class="mark" viewBox="0 0 100 100"><rect x="22" y="22" width="56" height="56" rx="8" stroke="url(#grad-sq)" stroke-width="12" fill="none"/></svg>'
};

const MARK_MINI_SVGS = {
  X: '<svg class="mini-mark" viewBox="0 0 100 100"><path stroke="url(#grad-x)" stroke-width="18" stroke-linecap="round" d="M22 22 L78 78 M78 22 L22 78"/></svg>',
  O: '<svg class="mini-mark" viewBox="0 0 100 100"><circle cx="50" cy="50" r="32" stroke="url(#grad-o)" stroke-width="18" fill="none"/></svg>',
  TRIANGLE: '<svg class="mini-mark" viewBox="0 0 100 100"><polygon points="50,18 84,80 16,80" stroke="url(#grad-tri)" stroke-width="16" fill="none" stroke-linejoin="round"/></svg>',
  SQUARE: '<svg class="mini-mark" viewBox="0 0 100 100"><rect x="18" y="18" width="64" height="64" rx="10" stroke="url(#grad-sq)" stroke-width="16" fill="none"/></svg>'
};

function getPlayerMarkSVG(symbol, mini = false) {
  const dict = mini ? MARK_MINI_SVGS : MARK_SVGS;
  if (symbol === 'X') return dict.X;
  if (symbol === 'O') return dict.O;
  if (symbol === '△') return dict.TRIANGLE;
  if (symbol === '□') return dict.SQUARE;
  return symbol;
}

function buildBoard(size, onCellClick, onHover, onLeave) {
  boardEl.innerHTML = '';
  boardEl.dataset.size = size;
  cellEls = [];

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => onCellClick(i));
    cell.addEventListener('mouseenter', () => onHover(i, cell));
    cell.addEventListener('mouseleave', () => onLeave(i, cell));
    boardEl.appendChild(cell);
    cellEls.push(cell);
  }
}

function renderBoard(board) {
  board.forEach((value, i) => {
    const cell = cellEls[i];
    if (!cell) return;
    if (value) {
      if (!cell.classList.contains('filled')) {
        cell.classList.add('filled');
        cell.innerHTML = getPlayerMarkSVG(value);
      }
    } else {
      cell.className = 'cell';
      cell.innerHTML = '';
    }
  });
}

/**
 * CRITICAL FIX: Loop bounds corrected from line.length - 1 to line.length
 * so all N cells in the winning streak light up.
 */
function highlightWinningCells(line) {
  for (let i = 0; i < line.length; i++) {
    if (cellEls[line[i]]) {
      cellEls[line[i]].classList.add('win');
    }
  }
}

function setBoardLocked(locked) {
  boardEl.classList.toggle('is-over', locked);
  cellEls.forEach(cell => cell.classList.toggle('is-over', locked));
}

function setStatus(text, playerSymbol = null) {
  statusTextEl.textContent = text;
  const dot = statusEl.querySelector('.dot');
  if (playerSymbol === 'X') dot.style.background = '#ff3b56';
  else if (playerSymbol === 'O') dot.style.background = '#00f2fe';
  else if (playerSymbol === '△') dot.style.background = '#10b981';
  else if (playerSymbol === '□') dot.style.background = '#f59e0b';
  else dot.style.background = '#8b5cf6';
}

function renderScoreboard(scores, players, activePlayer) {
  scoreboardEl.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = `score-card ${p === activePlayer ? 'active' : ''}`;
    card.innerHTML = `
      <span class="score-label">Player ${p}</span>
      <span class="score-value">${scores[p] || 0}</span>
    `;
    scoreboardEl.appendChild(card);
  });

  const drawCard = document.createElement('div');
  drawCard.className = 'score-card';
  drawCard.innerHTML = `
    <span class="score-label">Draws</span>
    <span class="score-value">${scores.draws || 0}</span>
  `;
  scoreboardEl.appendChild(drawCard);
}

function updateTagline(playerCount, size) {
  const numberNames = { 2: 'Two', 3: 'Three', 4: 'Four' };
  const totalSquares = size * size;
  const squareNames = { 9: 'Nine', 16: 'Sixteen', 25: 'Twenty-five', 36: 'Thirty-six' };
  const pName = numberNames[playerCount] || playerCount;
  const sName = squareNames[totalSquares] || totalSquares;
  taglineEl.textContent = `${pName} players. ${sName} squares. One clock ticking.`;
}

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  timerDisplayEl.textContent = `${mins}:${secs}`;
}

function renderMoves(moves, size) {
  if (moves.length === 0) {
    movesListEl.innerHTML = '<li class="empty-state">No moves made yet.</li>';
    return;
  }
  movesListEl.innerHTML = '';
  moves.forEach((m, idx) => {
    const row = Math.floor(m.index / size) + 1;
    const col = (m.index % size) + 1;
    const li = document.createElement('li');
    li.className = 'move-item';
    li.innerHTML = `
      <div class="move-player">
        <span>#${idx + 1}</span>
        ${getPlayerMarkSVG(m.player, true)}
      </div>
      <span class="move-coord">Row ${row}, Col ${col}</span>
    `;
    movesListEl.appendChild(li);
  });
  movesListEl.scrollTop = movesListEl.scrollHeight;
}

function renderMatchLog(logs) {
  if (logs.length === 0) {
    matchesListEl.innerHTML = '<p class="empty-state">No games completed yet.</p>';
    return;
  }
  matchesListEl.innerHTML = '';
  logs.forEach(log => {
    const card = document.createElement('div');
    card.className = 'match-card';
    const outcomeMarkup = log.winner
      ? `<div class="match-info">${getPlayerMarkSVG(log.winner, true)} <span>Winner</span></div>`
      : `<div class="match-info"><span>🤝 Draw</span></div>`;
    card.innerHTML = `
      ${outcomeMarkup}
      <span class="match-duration">${log.duration}</span>
    `;
    matchesListEl.prepend(card);
  });
}

function launchConfetti() {
  const colors = ['#ff3b56', '#ff914d', '#00f2fe', '#4facfe', '#10b981', '#f59e0b', '#8b5cf6'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-10px';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2400);
  }
}

/**
 * Thanos Snap Disintegration Ash Effect
 * Samples screen positions of dissolving elements and emits dispersing dust particles.
 */
function triggerThanosSnap(elementsToDissolve, callback) {
  const canvas = document.getElementById('snap-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];

  elementsToDissolve.forEach(el => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    el.classList.add('snap-dissolve');

    const particleCount = Math.min(80, Math.floor((rect.width * rect.height) / 180));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        vx: (Math.random() - 0.25) * 3.5,
        vy: -Math.random() * 3.5 - 0.8,
        size: Math.random() * 2.8 + 1,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        color: Math.random() > 0.4 ? '#94a3b8' : '#cbd5e1'
      });
    }
  });

  let animId;
  function animateDust() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha > 0) {
        alive = true;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });

    if (alive) {
      animId = requestAnimationFrame(animateDust);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elementsToDissolve.forEach(el => el && el.classList.remove('snap-dissolve'));
      if (callback) callback();
    }
  }

  animId = requestAnimationFrame(animateDust);
}

/* Ambient Particles Canvas Initialization */
(function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.dataset.theme === 'dark';
    ctx.fillStyle = isDark ? '#ffffff' : '#6366f1';

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.globalAlpha = p.alpha * (isDark ? 0.35 : 0.15);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  loop();
})();
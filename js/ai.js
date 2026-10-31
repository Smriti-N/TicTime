// AI opponent logic for TicTime.
// Provides getBestMove(board, size, player)

function getBestMove(board, size = 3, aiPlayer = 'O') {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const lines = getWinLines(size);
  const emptyIndices = [];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }

  if (emptyIndices.length === 0) return null;

  // 1. Instant Win: if AI can win immediately, take it
  for (const idx of emptyIndices) {
    board[idx] = aiPlayer;
    const res = getGameResult(board, size);
    board[idx] = null;
    if (res.status === 'win' && res.winner === aiPlayer) {
      return idx;
    }
  }

  // 2. Instant Block: if human can win on the next move, block it
  for (const idx of emptyIndices) {
    board[idx] = humanPlayer;
    const res = getGameResult(board, size);
    board[idx] = null;
    if (res.status === 'win' && res.winner === humanPlayer) {
      return idx;
    }
  }

  // 3. For 3x3 boards, use full Minimax (mathematically unbeatable)
  if (size === 3) {
    return getMinimaxMove3x3(board, aiPlayer, humanPlayer, lines, emptyIndices);
  }

  // 4. For 4x4 and 5x5 boards, use heuristic Alpha-Beta search
  return getSmartMoveLarge(board, size, aiPlayer, humanPlayer, lines, emptyIndices);
}

// ---------------- 3x3 Minimax ----------------
function getMinimaxMove3x3(board, aiPlayer, humanPlayer, lines, emptyIndices) {
  function checkWin(p) {
    return lines.some((line) => line.every((i) => board[i] === p));
  }

  function minimax(depth, isMaximizing, alpha, beta) {
    if (checkWin(aiPlayer)) return 10 - depth;
    if (checkWin(humanPlayer)) return depth - 10;

    const empties = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) empties.push(i);
    }
    if (empties.length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -1000;
      for (const idx of empties) {
        board[idx] = aiPlayer;
        const evaluation = minimax(depth + 1, false, alpha, beta);
        board[idx] = null;
        if (evaluation > maxEval) maxEval = evaluation;
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = 1000;
      for (const idx of empties) {
        board[idx] = humanPlayer;
        const evaluation = minimax(depth + 1, true, alpha, beta);
        board[idx] = null;
        if (evaluation < minEval) minEval = evaluation;
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  let bestScore = -Infinity;
  let bestMove = emptyIndices[0];

  // Prefer center if open on first move
  if (board[4] === null) return 4;

  for (const idx of emptyIndices) {
    board[idx] = aiPlayer;
    const score = minimax(0, false, -Infinity, Infinity);
    board[idx] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }

  return bestMove;
}

// ---------------- 4x4 & 5x5 Heuristic Search ----------------
function getSmartMoveLarge(board, size, aiPlayer, humanPlayer, lines, emptyIndices) {
  const center = (size - 1) / 2;

  function evaluate() {
    let score = 0;
    for (const line of lines) {
      let aiCount = 0;
      let huCount = 0;
      for (const i of line) {
        if (board[i] === aiPlayer) aiCount++;
        else if (board[i] === humanPlayer) huCount++;
      }
      if (aiCount > 0 && huCount > 0) continue; // blocked line
      if (aiCount === 4) return 10000;
      if (huCount === 4) return -10000;
      if (aiCount === 3) score += 180;
      else if (aiCount === 2) score += 25;
      else if (aiCount === 1) score += 3;

      if (huCount === 3) score -= 220;
      else if (huCount === 2) score -= 30;
      else if (huCount === 1) score -= 4;
    }
    return score;
  }

  // Sort candidate moves prioritizing center positions and proximity to pieces
  const scoredMoves = emptyIndices.map((idx) => {
    const r = Math.floor(idx / size);
    const c = idx % size;
    const distFromCenter = Math.abs(r - center) + Math.abs(c - center);
    let lineParticipation = 0;
    for (const line of lines) {
      if (line.includes(idx)) lineParticipation++;
    }
    return {
      index: idx,
      score: lineParticipation * 5 - distFromCenter * 2,
    };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  const candidateIndices = scoredMoves.slice(0, Math.min(scoredMoves.length, 12)).map((m) => m.index);

  function checkWin(p) {
    return lines.some((line) => line.every((i) => board[i] === p));
  }

  function search(depth, isMaximizing, alpha, beta) {
    if (checkWin(aiPlayer)) return 10000 - depth;
    if (checkWin(humanPlayer)) return depth - 10000;
    if (depth === 0) return evaluate();

    const empties = [];
    for (const idx of candidateIndices) {
      if (board[idx] === null) empties.push(idx);
    }
    if (empties.length === 0) return evaluate();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of empties.slice(0, 8)) {
        board[idx] = aiPlayer;
        const val = search(depth - 1, false, alpha, beta);
        board[idx] = null;
        maxEval = Math.max(maxEval, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of empties.slice(0, 8)) {
        board[idx] = humanPlayer;
        const val = search(depth - 1, true, alpha, beta);
        board[idx] = null;
        minEval = Math.min(minEval, val);
        beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  let bestVal = -Infinity;
  let bestIdx = candidateIndices[0];

  for (const idx of candidateIndices) {
    board[idx] = aiPlayer;
    const val = search(2, false, -Infinity, Infinity);
    board[idx] = null;
    if (val > bestVal) {
      bestVal = val;
      bestIdx = idx;
    }
  }

  return bestIdx;
}


# Architecture
Architecture

TicTime is a plain HTML/CSS/JavaScript app — no frameworks, no build step. The code is split into three layers with a strict one-way dependency: rules → state → screen. Each JavaScript file has exactly one job, and only one of them is allowed to touch the page.

File roles
File	Role
index.html	Page layout: header, scoreboard, status line, board container, controls, and the script tags that load the JS files in order (game.js → ui.js → main.js).
css/styles.css	All styling and animations: board grid, mark colours, winning-cell highlight, confetti, and light/dark themes (driven by data-theme on <html>).
js/game.js	Rules only. Pure functions with no DOM access: createEmptyBoard(), nextPlayer(), and getGameResult(board), which returns { status, winner, line } — status is 'playing', 'win' or 'draw'.
js/ui.js	Screen only. Everything that touches the DOM lives here: buildBoard(), renderBoard(), setStatus(), renderScores(), highlightWinningCells(), setBoardLocked(), setTheme(), launchConfetti(). It never decides anything about the game.
js/main.js	Glue. Holds the single state object (board, current player, game-over flag, scores, theme), wires up event handlers, and translates rule results into UI calls.
Because the files are loaded as plain scripts (no modules), they communicate through shared global functions. The load order in index.html matters: main.js calls functions defined in game.js and ui.js, so it must come last.

What happens when you click a square
Click — buildBoard() (in ui.js) created nine .cell divs at startup, each with a click listener that calls handleCellClick(index) in main.js.
Guard — handleCellClick returns immediately if state.gameOver is true.
Update state — the current player's mark is written into state.board[index].
Redraw — renderBoard(state.board) updates the clicked cell's SVG mark (it skips cells whose mark hasn't changed).
Judge — getGameResult(state.board) (in game.js) checks the eight win lines, then whether the board is full.
Branch on the result:
Win → state.gameOver = true, the winner's score is incremented, the winning cells are highlighted, the status reads "Player X/O wins!", the board is locked, the scoreboard re-renders, and confetti fires.
Draw → state.gameOver = true, the status reads "It's a draw!", and the board is locked.
Still playing → nextPlayer() flips the turn and the status updates to "Player X/O's turn".
New Game — startNewGame() resets the board and turn (scores are kept), re-renders, and unlocks the board.
Data flow
            click
              │
              ▼
┌─────────────────────────┐
│  ui.js  buildBoard()    │  creates cells + listeners
└──────────┬──────────────┘
           │ handleCellClick(index)
           ▼
┌─────────────────────────┐
│  main.js  state         │  board, currentPlayer, gameOver, scores
│  handleCellClick()      │
└──────────┬──────────────┘
           │ getGameResult(board)
           ▼
┌─────────────────────────┐
│  game.js  rules         │  { status: 'playing' | 'win' | 'draw' }
└──────────┬──────────────┘
           │ result
           ▼
┌─────────────────────────┐
│  ui.js  render*()       │  renderBoard, setStatus, renderScores,
│                         │  highlightWinningCells, launchConfetti
└──────────┬──────────────┘
           ▼
         screen
The key rule to keep in mind when contributing: game.js never touches the DOM, and ui.js never changes game state. All decisions flow through main.js.

# Architecture

TicTime is three plain scripts and one stylesheet. There is no build step and no modules: `index.html` loads the scripts in order, so they share one global scope.

```
index.html  →  game.js  →  ui.js  →  main.js
               (rules)     (screen)   (state + events)
```

## Files

| File | Job | Touches the page? |
| --- | --- | --- |
| `js/game.js` | Board size, winning lines, win/draw detection, computer player | No |
| `js/ui.js` | Builds and draws the board, scores, status text, move list, theme, confetti | Yes |
| `js/main.js` | Holds the game state, handles clicks and menus, calls `game.js` and `ui.js` | Through `ui.js` |
| `css/styles.css` | Colours (light and dark), layout, animations | n/a |

Keep that split: rules never touch the DOM, and only `ui.js` reads or writes page elements (`main.js` just reads the two menus).

## Game state (`state` in `main.js`)

| Field | Meaning |
| --- | --- |
| `size`, `mode` | Board size (3, 4 or 5) and `'two-player'` or `'computer'` |
| `board` | The live board: an array of `'X'`, `'O'` or `null`, one entry per square (row by row) |
| `moves` | Every move so far, as `{ player, index }` |
| `viewIndex` | How many moves are on screen. Equal to `moves.length` when you are looking at the live game, smaller when reviewing the history |
| `currentPlayer`, `result`, `gameOver` | Whose turn it is, the result from `getGameResult()`, and whether the game has ended |
| `thinking` | True while the computer waits before moving; clicks are ignored |
| `scores`, `theme` | Scoreboard and the current theme |

## Data flow

1. A square is clicked → `ui.js` calls `handleCellClick(index)` in `main.js`.
2. `playMove()` updates `state`, then asks `getGameResult()` (`game.js`) whether someone won or the board is full.
3. `render()` redraws the whole screen from `state`: board at `viewIndex`, win highlight, locked board, status text, scores and move list.
4. In `vs Computer` mode `playMove()` schedules the computer's reply with `getComputerMove()`.

Because `render()` always draws from `state`, any new feature should change `state` and call `render()` rather than editing the page directly.

## Rules API (`game.js`)

- `getWinLength(size)`: marks in a row needed (3 on 3 × 3, otherwise 4)
- `getWinLines(size)`: every winning line as a list of square indexes
- `getGameResult(board)`: returns `{ status: 'win' | 'draw' | 'playing', winner, line }`
- `getComputerMove(board, player)`: returns the square the computer picks, or `-1` if the board is full

## Ideas for next steps

- Let the player choose X or O (or who starts) against the computer
- Difficulty levels for the computer
- Remember the scores between visits
- Screenshots for the README
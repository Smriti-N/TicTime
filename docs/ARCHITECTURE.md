# Architecture

# Project Architecture

This document explains the internal structure of the Tic-Tac-Toe application, detailing how files collaborate, the lifecycle of a move event, and the data flow across modules.

---

## 1. File Roles & Responsibilities

| File / Folder | Role & Purpose |
| :--- | :--- |
| **`index.html`** | Defines the foundational structure and DOM layout: the header, score counters, 3×3 game board, and reset buttons. Loads stylesheets and imports the JavaScript modules. |
| **`css/`** | Contains visual styles, layout formatting (Grid/Flexbox for board alignment), theme colors, animations, and responsive breakpoints for mobile and desktop screens. |
| **`js/main.js`** | The primary orchestrator/entry point. Initializes the application on DOM ready, attaches click listeners to board squares and action buttons, and coordinates communication between `js/game.js` and `js/ui.js`. |
| **`js/game.js`** | Pure game logic state machine: tracks board array state (`board = Array(9)`), current active player (`'X'` or `'O'`), validates valid moves, checks winning combinations, and evaluates draw conditions. |
| **`js/ui.js`** | DOM presentation controller: reads values or status messages and applies updates to the user interface (rendering markers into squares, highlighting winning tiles, updating turn indicators, and refreshing score displays). |

---

## 2. Step-by-Step Flow: Clicking a Square to Screen Update

When a player clicks on an empty cell on the board:

1. **User Interaction:** The player clicks a grid cell `<div>` or `<button>` corresponding to a board index (0–8).
2. **Event Capture (`js/main.js`):** The event listener captures the click event and extracts the cell index from `data-index` or its DOM identifier.
3. **Move Validation & State Update (`js/game.js`):**
   * `main.js` calls `makeMove(index)`.
   * `game.js` checks if the square is empty and if the game is still active.
   * If valid, `game.js` records the current player's mark in its board state array.
4. **Win/Draw Evaluation (`js/game.js`):**
   * `game.js` checks all 8 win lines (3 rows, 3 columns, 2 diagonals).
   * It determines the outcome: **Win**, **Draw**, or **Continue**.
   * If the match continues, `game.js` switches the active turn (`'X'` ↔ `'O'`).
5. **UI Rendering (`js/ui.js`):**
   * `main.js` passes the result to `ui.js`.
   * `ui.js` injects the player's symbol (`X` or `O`) into the clicked cell with the appropriate CSS classes.
   * If a win occurred, `ui.js` highlights the winning combination, triggers the win banner, and updates the score counters.
   * If a draw occurred, `ui.js` displays the draw message and updates the tie counter.
   * If play continues, `ui.js` updates the turn status indicator to show the next active player.

---

## 3. Data Flow Diagram

```mermaid
flowchart TD
    User([👤 User Clicks Cell]) -->|Click Event| Main[js/main.js\nEvent Listener]
    
    subgraph Logic & State
        Main -->|makeMove(index)| Game[js/game.js\nGame Engine]
        Game -->|1. Validate Move| Valid{Is Cell Empty?}
        Valid -- No --> Ignore([Ignore Move])
        Valid -- Yes --> UpdateState[2. Update Board Array & State]
        UpdateState --> CheckEnd{3. Check Win / Draw}
        CheckEnd -- No End --> SwitchPlayer[4. Switch Current Player]
    end

    subgraph UI Updates
        SwitchPlayer -->|Return Next Turn| Main
        CheckEnd -- Win / Draw -->|Return Result & Line| Main
        
        Main -->|updateBoard(index, symbol)| UI[js/ui.js\nUI Controller]
        Main -->|updateStatus(status)| UI
        Main -->|updateScore(winner)| UI
        
        UI -->|Manipulate DOM| DOM[index.html / Browser Screen]
    end

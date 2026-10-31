# TicTime ⏱️❌⭕

A colourful, animated Tic-Tac-Toe game built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no installs.

> 🎯 **Hack Day project.** TicTime is *deliberately incomplete*: a few things are broken and a few features are missing. Each one is an issue waiting for you. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Screenshots




## Run it

You only need a browser.

```bash
git clone <your-fork-url>
cd TicTime
```

Then either double-click `index.html`, or serve the folder (handy if you work on offline/PWA features):

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or: npx serve

## How to play

1. Player **X** goes first, then players take turns clicking an empty square.
2. Get three of your marks in a row (across, down or diagonally) to win.
3. If all nine squares fill up with no winner, it's a draw.
4. **New Game** clears the board; the scoreboard keeps counting.

## Project structure

```
TicTime/
├── index.html        # page layout
├── css/styles.css    # all styling and animations
└── js/
    ├── game.js       # rules: win/draw detection (no DOM code)
    ├── ui.js         # drawing the board, scores, theme, confetti
    └── main.js       # game state + event handlers
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## License
## 🛠️ Troubleshooting

### 1. Changes made to code are not showing in the browser
* **Cause:** Browsers cache CSS and JavaScript files aggressively.
* **Fix:** Perform a hard refresh:
  * **Windows / Linux:** Press `Ctrl + F5` or `Ctrl + Shift + R`.
  * **macOS:** Press `Cmd + Shift + R`.
  * Alternatively, open Developer Tools (`F12`), right-click the browser reload button, and select **Empty Cache and Hard Reload**.

### 2. Assets (fonts, images, or audio) fail to load or look broken
* **Cause:** Opening the project via the file protocol (`file:///path/to/index.html`) can block relative assets or cause CORS policy errors.
* **Fix:** Serve the project using a local HTTP server instead of double-clicking the HTML file:
  * **VS Code:** Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.
  * **Python:** Run `python -m http.server 8000` (Python 3) in the project directory, then visit `http://localhost:8000`.
  * **Node.js:** Run `npx serve .` in the project root.

### 3. Blank white screen or the game does not respond to clicks
* **Cause:** An unhandled JavaScript error or broken script reference is halting execution.
* **Fix:** 
  1. Open Developer Tools (`F12` or `Ctrl + Shift + I` / `Cmd + Option + I`).
  2. Navigate to the **Console** tab to view the red error logs.
  3. Verify that script tags in `index.html` point to the correct relative paths (e.g., `<script src="script.js"></script>`) and that scripts are loaded with `defer` or placed right before the closing `</body>` tag.

### 4. Custom fonts or styling look different across browsers
* **Cause:** Missing fallback font definitions or external Google Font links failing to load / blocked by network restrictions.
* **Fix:** 
  * Check the `<link>` or `@import` rule for the font stylesheet in `index.html` or `style.css`.
  * Ensure standard CSS fallback fonts are defined (e.g., `font-family: 'YourCustomFont', system-ui, sans-serif;`).

---

## ❓ Frequently Asked Questions (FAQ)

### 1. Who plays first?
Player `X` always goes first by default at the start of a new match. After a round finishes, clicking the **Restart / Reset** button resets the turn back to Player `X`.

### 2. How are draws/ties counted?
A draw is declared when all 9 grid squares are filled and neither player has achieved 3 matching symbols horizontally, vertically, or diagonally. When this occurs, the status banner displays "It's a Draw!", and the draw counter increments by 1.

### 3. How do I reset the game scores?
Reloading the page or clicking the designated score reset button will clear the match tally and restore player scores and draw counts to `0`.

[MIT](LICENSE)

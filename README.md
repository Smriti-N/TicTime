# TicTime ⏱️❌⭕

A colourful, animated Tic-Tac-Toe game built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no installs.

> 🎯 **Hack Day project.** TicTime is *deliberately incomplete*: a few things are broken and a few features are missing. Each one is an issue waiting for you. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Screenshots

_Coming soon._

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
```

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

## Troubleshooting

### 1. The page looks unchanged after I edited the code
**Cause:** The browser is serving cached CSS/JS.
**Fix:** Do a hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (macOS). If that doesn't work, open DevTools → **Network** tab, tick **Disable cache**, and reload with DevTools open.

### 2. The page is blank or something doesn't work, but there's no visible error
**Cause:** A JavaScript error is stopping the script, and it only shows in the console.
**Fix:** Open DevTools (`F12` or `Ctrl/Cmd + Shift + I`) → **Console**. Read the first red error, since later errors are often just side effects of it. Typical examples:
- `Uncaught ReferenceError: x is not defined` → a typo, or the script that defines `x` loads after the one using it. Here, `main.js` must load after `game.js` and `ui.js`.
- `Uncaught TypeError: Cannot read properties of null` → the script ran before the element existed. Put the `<script>` tags at the end of `<body>`, or add `defer`.

### 3. It works when I double-click the file, but fetch/modules fail with CORS errors
**Cause:** Opening the page via `file://` blocks `fetch()`, ES modules (`type="module"`), service workers and other features for security reasons.
**Fix:** Serve the folder over HTTP instead:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or: npx serve
```

### 4. "Failed to load resource: 404 (Not Found)" for CSS, JS, or images
**Cause:** A wrong path, wrong capitalization (paths are case-sensitive on most servers), or the file isn't where the page expects it.
**Fix:** Check the **Network** tab for the red request and compare its URL to the file's real location. Use relative paths like `./css/styles.css` and match the exact filename casing.

### 5. "Port 8000 is already in use"
**Cause:** A previous server process is still running.
**Fix:** Use another port (`python3 -m http.server 8080`) or stop the old process:

```bash
# macOS/Linux
lsof -i :8000
kill <PID>

# Windows (PowerShell)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## FAQ

### Who plays first?
Player **X** always goes first, then players alternate.

### How are draws counted?
A draw happens when all nine squares are filled and nobody has three in a row. The round ends with no winner. If the scoreboard doesn't show draws yet, that's a good first issue.

### What counts as a win?
Three of your marks in a row: across, down or diagonally.

### How do I start a new round, and do I lose my scores?
Click **New Game**. It clears the board, and the scoreboard keeps counting. Refreshing the page resets the scores unless you add persistence.

### Can I play against the computer?
Not yet. TicTime is two-player on one device, and a computer opponent is a great feature to contribute.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## Licens

[MIT](LICENSE)
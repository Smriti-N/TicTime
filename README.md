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

## Running tests

Run the automated game rule tests with Node.js:

```bash
npm test
# or:
node --test tests/game.test.js
```


## How to play

1. Player **X** goes first, then players take turns clicking an empty square.
2. Get three of your marks in a row (across, down or diagonally) to win.
3. If all nine squares fill up with no winner, it's a draw.
4. **New Game** clears the board; the scoreboard keeps counting.

## Project structure

For an in-depth explanation of component roles, data flow, and interaction diagrams, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
TicTime/
├── .github/
│   └── workflows/
│       └── test.yml  # GitHub Actions automated test workflow
├── index.html        # semantic layout & accessibility attributes
├── css/styles.css    # all styling, themes, animations & focus rings
├── docs/
│   └── ARCHITECTURE.md # architecture, component roles & data flow
├── js/
│   ├── game.js       # rules: win/draw detection & coordinates
│   ├── ai.js         # computer opponent decision engine
│   ├── ui.js         # drawing board, move history timeline, scores, theme, confetti
│   └── main.js       # game state, time travel history + event handlers
└── tests/
    └── game.test.js  # automated test suite for game rules
```

## Troubleshooting

Here are solutions to common issues when developing or running TicTime:

1. **Changes in JavaScript or CSS are not showing up:**
   - Your browser might be serving a cached version. Perform a hard refresh: press `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (macOS), or open the browser in an Incognito / Private window.
2. **Page appears completely blank or broken:**
   - Open your browser's Developer Tools by pressing `F12` or right-clicking and selecting **Inspect**. Look at the **Console** tab for JavaScript syntax errors or failed script loading paths. Ensure all four script tags in `index.html` are present and in the correct order.
3. **Features fail when opening `index.html` directly (`file://` protocol):**
   - Some modern web APIs and storage policies have restrictions on the `file://` scheme. Serve the folder using a local web server:
     ```bash
     python -m http.server 8000
     # or: npx serve
     ```
     Then open `http://localhost:8000` in your browser.
4. **Custom fonts look different or system default:**
   - The game loads the 'Sora' font from Google Fonts. If you are offline or have network restrictions blocking `fonts.googleapis.com`, the browser falls back to `system-ui`. Ensure internet access or configure local font fallbacks.

## FAQ

1. **Who always plays first?**
   - Player **X** always starts the game upon initial launch and after clicking **New Game**.
2. **How are draws counted and handled?**
   - When all cells on the board are occupied and neither player has achieved a winning line, the game declares a draw. The "Draws" counter increments by 1 on the scoreboard while X and O scores remain unchanged.
3. **Does clicking "New Game" reset my win scores?**
   - No, clicking **New Game** only clears the board for the next match. To reset the scores back to 0, click the **Reset Scores** button.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## License

[MIT](LICENSE)

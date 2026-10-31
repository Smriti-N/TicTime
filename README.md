# TicTime ⏱️❌⭕

A colourful, animated Tic-Tac-Toe game built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no installs.

> 🎯 **Hack Day project.** TicTime is *deliberately incomplete*: a few things are broken and a few features are missing. Each one is an issue waiting for you. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Screenshots

![Game in Progress](docs/images/progress.jpg.png)
![Win State](docs/images/wining.png)
![Dark Mode Theme](docs/images/dark.jpg.png)


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

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## License

[MIT](LICENSE)

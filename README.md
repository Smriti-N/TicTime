# TicTime ⏱️❌⭕

A colourful, animated Tic-Tac-Toe game built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no installs.

> 🎯 **Hack Day project.** See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## Features

- Two players on one screen, or play **against the computer** (you are X)
- **3 × 3, 4 × 4 and 5 × 5** boards (3 in a row on 3 × 3, 4 in a row on the bigger boards)
- **Move history**: click any move to look back at the board, then jump back to the latest
- Scoreboard with wins and draws
- Light and dark theme, remembered between visits
- Keyboard friendly: Tab to a square, arrow keys to move, Enter or Space to play
- Win highlight and confetti (turned off if your system asks for reduced motion)

## Screenshots

_Coming soon._

## Run it

You only need a browser.

```bash
git clone <your-fork-url>
cd TicTime
```

Then either double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or: npx serve
```

## How to play

1. Player **X** goes first, then players take turns clicking an empty square.
2. Get the required number of marks in a row (across, down or diagonally) to win.
3. If every square fills up with no winner, it's a draw.
4. **New Game** clears the board; the scoreboard keeps counting. **Reset Scores** sets the scoreboard back to zero.
5. Changing the **Mode** or **Board** size starts a new game and resets the scores.
6. In **vs Computer** mode the computer plays O. On 3 × 3 it never loses, so the best you can do is a draw. On the bigger boards it takes a win when it sees one and blocks yours, but it is easier to beat.
7. Click any entry in **Move history** to view the board at that point. The board is read-only while you look back; click the last entry to return to the game.

## Project structure

```
TicTime/
├── index.html        # page layout
├── css/styles.css    # all styling and animations
├── js/
│   ├── game.js       # rules: win/draw detection, computer player (no DOM code)
│   ├── ui.js         # drawing the board, scores, history, theme, confetti
│   └── main.js       # game state + event handlers
├── docs/ARCHITECTURE.md
└── .github/          # PR template and label workflow
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## License

[MIT](LICENSE)
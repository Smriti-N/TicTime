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

## Install it and play offline

When TicTime is served over `http://localhost` (or any `https://` site), the browser can install it as an app, and it keeps working with no internet. This doesn't work when you double-click `index.html`, because browsers only run service workers over http(s).

**How to test it**

1. Serve the folder with `python3 -m http.server 8000` and open http://localhost:8000.
2. Open DevTools (F12) → **Application**:
   - **Manifest**: the name, theme colour and icons show up with no errors.
   - **Service workers**: `sw.js` is *activated and is running*.
   - **Cache storage**: `tictime-app-v1` lists the game files.
3. **Install**: click the install icon at the right of the address bar (Chrome/Edge), or find *Install TicTime* in the browser menu. On a phone, use *Add to Home Screen* / *Install app*.
4. **Offline**: in DevTools → **Network**, set throttling to *Offline* and reload. The game still loads and plays. The Sora font is saved for offline use the second time you open the game online (the first visit only installs the service worker); until then, offline play uses your system font.

**Working on the code?** The service worker answers from its cache first and refreshes it in the background, so after you edit a file, reload twice to see the change (or tick *Update on reload* under Application → Service workers). If you add a file the game needs, add it to `APP_FILES` in `sw.js` and bump `APP_CACHE` to `tictime-app-v2`.

## How to play

1. Player **X** goes first, then players take turns clicking an empty square.
2. Get three of your marks in a row (across, down or diagonally) to win.
3. If all nine squares fill up with no winner, it's a draw.
4. **New Game** clears the board; the scoreboard keeps counting.

## Project structure

```
TicTime/
├── index.html            # page layout
├── manifest.webmanifest  # app name, icons and colours used when installing
├── sw.js                 # service worker: caches the game for offline play
├── icons/                # app icons (icon.svg + PNG sizes)
├── css/styles.css        # all styling and animations
└── js/
    ├── game.js           # rules: win/draw detection (no DOM code)
    ├── ui.js             # drawing the board, scores, theme, confetti
    └── main.js           # game state + event handlers
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Pick an issue labelled `documentation`, `beginner` or `hard`, fix it, and open a pull request.

## License

[MIT](LICENSE)

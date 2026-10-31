TicTime ⏱️❌⭕
A colourful, animated Tic-Tac-Toe game built with plain HTML, CSS and JavaScript. No frameworks, no build step, no installs.

🎯 Hack Day project. TicTime is deliberately incomplete: a few things are broken and a few features are missing. Each one is an issue waiting for you. See CONTRIBUTING.md(opens in a new tab) to get started.

Screenshots
Coming soon.

Run it
You only need a browser.

git clone <your-fork-url>
cd TicTime
Then either double-click index.html, or serve the folder (handy if you work on offline/PWA features):

python3 -m http.server 8000     # then open http://localhost:8000
# or: npx serve
How to play
Player X goes first, then players take turns clicking an empty square.
Get three of your marks in a row (across, down or diagonally) to win.
If all nine squares fill up with no winner, it's a draw.
New Game clears the board; the scoreboard keeps counting.
Troubleshooting
The page is blank or nothing happens when I click
Open the browser console (F12, or right-click → Inspect → Console) and look for red errors. The most common cause is a file that failed to load — check that index.html, css/styles.css and the three files in js/ are all present and that you haven't renamed any folders. A typo in a <script src="..."> path shows up here as a 404.

My changes aren't showing up
Your browser is serving a cached copy of the old files. Do a hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac). If that still doesn't work, open DevTools → Network tab, tick Disable cache, and refresh again.

The fonts or colours look different from the screenshots
Custom fonts load from the internet, so on a slow or offline connection the browser falls back to a default font. Check your connection and refresh. If you opened the page days ago, a hard refresh (see above) also pulls the newest stylesheet.

file:// vs a local server — which should I use?
Double-clicking index.html opens it as a file:// page, which works for the basic game. Some browser features (service workers, fetch, modules) are blocked on file://, so if you're working on offline/PWA features, serve the folder instead:

python3 -m http.server 8000     # then open http://localhost:8000
The game works on my computer but not on my phone
Open the page on your phone over your local network (run the local server above and visit http://<your-computer-IP>:8000 from the phone). If the board overflows or buttons are hard to tap on a small screen, that's a known layout issue — check the open issues list.

FAQ
Who plays first? Player X always makes the first move of every game, including after pressing New Game.

How are draws counted? When all nine squares are filled and nobody has three in a row, the game is a draw and the Draws score goes up by one. Neither X nor O gets a point.

Does the scoreboard reset when I start a new game? No. New Game only clears the board — the X, O and Draws scores keep counting until you reload the page.

Can I play against the computer? Not yet — TicTime is two players sharing one screen. A single-player mode would be a great feature to propose.

Do I need to install anything to contribute? No. It's plain HTML, CSS and JavaScript — a text editor and a browser are enough. There's no npm install and no build step.

Project structure
TicTime/
├── index.html        # page layout
├── css/styles.css    # all styling and animations
└── js/
    ├── game.js       # rules: win/draw detection (no DOM code)
    ├── ui.js         # drawing the board, scores, theme, confetti
    └── main.js       # game state + event handlers
See docs/ARCHITECTURE.md(opens in a new tab) for how these files work together.

Contributing
Read CONTRIBUTING.md(opens in a new tab). Pick an issue labelled documentation, beginner or hard, fix it, and open a pull request.

License
MIT
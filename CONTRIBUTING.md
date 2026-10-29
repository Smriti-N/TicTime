# Contributing to TicTime

Welcome to Hack Day! Here is how to ship your first pull request.

## Rules of the day

- Every issue has exactly one tag: `documentation` (1 pt), `beginner` (10 pts) or `hard` (20 pts).
- Pull requests are **never merged**. Every team starts from the same code, and each PR is judged on its own.
- Several teams may fix the same issue. That's fine.
- One PR per team per issue. Only PRs opened before the cut-off count.
- Keep your change **focused**: one issue = one PR, no unrelated edits.

## Steps

1. **Fork** this repo on GitHub.
2. **Clone** your fork and open the folder in your editor.
3. **Create a branch** from `main`:
   ```bash
   git checkout -b fix/issue-12-short-description
   ```
4. **Pick an issue**, read "Done when", then make your change. Open `index.html` in a browser to test.
5. **Commit** with a clear message:
   ```bash
   git add .
   git commit -m "Fix: highlight all three winning cells"
   ```
6. **Push** and open a **pull request against `main`** of the original repo.
7. In the PR description write `Closes #<issue number>`, explain what changed and why, and add a screenshot if the change is visible.

## How PRs are scored

Every issue has exactly one tag:

| Tag | Points | Expected time |
| --- | --- | --- |
| `documentation` | 1 | under 20 min |
| `beginner` | 10 | under 40 min |
| `hard` | 20 | 1- 3 hours |

Judges look at: does it solve the issue, is the change clean and small, did you test it, is the PR description clear.

## Tips

- Open the browser DevTools (F12) to see errors and inspect elements.
- Some logic bugs affect more than one issue. Fix only what *your* issue asks for.
- Stuck? Ask a volunteer.

# Nested — Ultimate Tic-Tac-Toe self-play lab

A dependency-free browser application with two independently trained RL agents, a live nested board, step/pause/fast training controls, evaluation charts, policy inspection, human challenges and checkpoint import/export. The only optional external resource is Google Fonts; system fonts are the fallback.

## Run locally (Windows PowerShell)

Install Python 3 to serve the app. Node.js is only needed to run tests (14 automated tests). From the extracted project folder, open PowerShell or the VS Code terminal and run:

```powershell
py -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open http://localhost:8080. Keep that terminal open. Do not open index.html as a file: ES modules and the worker need HTTP.

Run tests in another terminal:

```powershell
node --test tests/engine.test.js tests/worker.test.js
```

No npm install or build is required. On macOS/Linux use `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist`.

## Put this project on GitHub

The source ZIP is portable and excludes the original hosting identity, Git history and credentials. Extract it, then put the **contents of `nested-rl`** at the root of a new repository. Include `.github/workflows`, `dist`, `tests`, `package.json`, `.gitignore` and this README. Upload the extracted files, not the ZIP itself.

This repository already has a placeholder README. For your first upload, clone it and copy the extracted files into that checkout; this replaces the placeholder README. If starting a separate, genuinely empty repository in the future, use:

```powershell
git init -b main
git add .
git commit -m "Add Ultimate Tic-Tac-Toe RL lab"
git remote add origin https://github.com/Hazzah1367/rl-ultimate-tic-tac-toe.git
git push -u origin main
```

Authenticate using Git Credential Manager or GitHub CLI if prompted. Existing repositories should be cloned first and have these files copied into the checkout; do not overwrite an unrelated project or run `git init` inside another repository.

## Other people: run from GitHub

Clone the public repository, then run:

```powershell
git clone https://github.com/Hazzah1367/rl-ultimate-tic-tac-toe.git nested-rl
cd nested-rl
py -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Open http://localhost:8080 and click **Start learning**. Use **Accelerate** to train faster, then **Watch** to inspect decisions. Stop the server with Ctrl+C. On macOS/Linux replace the last command with `python3 -m http.server 8080 --bind 127.0.0.1 --directory dist`. No Python packages, npm install, GPU or backend are needed.

They can also download and extract the repository ZIP from GitHub's **Code → Download ZIP**, then run the same server command in its extracted root folder.

## Other people: open a website with GitHub Pages

A ready-to-run manual publishing workflow is included at `.github/workflows/pages.yml`.

1. Commit the files to your repository's default branch.
2. In the repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
3. Open **Actions → Publish GitHub Pages → Run workflow**, selecting the default branch.
4. The workflow tests the app, uploads `dist`, then deploys it. Copy the resulting site URL from the deployment or Pages settings and share it.
5. After code changes, run the publishing workflow again. The separate Test workflow runs automatically on pushes and pull requests.

Pages availability depends on your GitHub plan and repository visibility. Publishing the website can expose the app to visitors independently of repository visibility; choose the audience you intend in GitHub. This workflow has been prepared from GitHub's documentation but cannot be verified against your repository until it is uploaded and run there.

Each visitor's computer runs its own training. Weights are stored in their own browser; there is no shared training server. Use **Export progress** and **Import** to transfer a trained pair of bots between browsers, laptops or the hosted/local versions. Keep a consistent URL and port for local saves; changing the origin changes the browser storage location.

References: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages and https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Feature fix (1 November 2026)

Threat counting now returns zero for already-won or full small boards. Features 3 (fork) and 4 (own threats) no longer treat the unused cells of a newly claimed board as future winning opportunities. Genuine forks remain active on open boards. The shared helper also keeps opponent threat counts consistent.

Existing checkpoints remain loadable; no saved weights are deleted automatically. For a clean experiment with the corrected features, export any old progress you want to keep, then reset once. Old evaluation history used the previous feature definition and should not be interpreted as a controlled before/after comparison.

## Rules

A move's cell index routes the opponent to the matching board. Won or full boards are closed. If routed to a closed board, any open board is legal. Three owned boards in a macro line wins. Full local boards without a line are neutral draws. If all local boards close without a macro winner, the game draws. X starts; agent identities swap marks every training game.

## Learning

Each agent owns 18 independent linear action-policy weights, initialised to zero. Action features describe local wins/blocks/forks/threats, cell and board position, macro wins/blocks, available lines and destination-board risks. Hand-engineered features generalise across board symmetries; weights, including preferences for captures or blocks, are learned rather than fixed.

The legal-move-masked policy is softmax(w dot features), mixed with uniform exploration epsilon = max(.04, .65 exp(-completedGames/3500)). Episodic REINFORCE uses the exact mixture-policy log-probability gradient, a moving return baseline, discount .99 per own decision, learning rate .035 by default, update norm clipping at 5, and weights bounded to [-12,12]. Each completed game updates both policies. Reward is +1/-1/0 for win/loss/draw, with +.12 for capturing a local board and -.12 when an opponent captures one (attributed to the opponent's preceding decision). This shaping changes the objective and does not guarantee optimal play.

Both watch and accelerated modes train the same worker, with a seeded training PRNG. Human games and evaluations never update weights. Fast mode yields frequently to retain control responsiveness and displays sampled live positions. Training only runs while the page is open; mobile/background throttling is browser controlled.

Every 250 games, evaluation plays 40 games per agent against a uniform random opponent with a fixed seed and balanced first turns. The chart shows (wins + .5*draws) / games. These small samples are noisy; self-play win rates are not strength measures. A separate manual test plays 80 games per agent against a fixed tactical policy (macro wins, captures, blocks, forks, routing safety). Evaluation samples learned policies with exploration disabled, rather than forcing argmax.

## Checkpoints

Local storage saves weights, baselines, update counts, win totals and up to 200 evaluation points at evaluations, pause, periodically during training and when the page is hidden. Export and import JSON to transfer devices. Current unfinished game, PRNG state, speed/mode and learning-rate UI settings are not restored. Resuming is a new game using the saved learned policies, not a bit-exact replay.

## Validation

14 automated tests cover routing, closed boards, local/macro wins, draws, illegal actions, uniform initial policies, positive reinforcement, legal seeded games, independent updates, evaluation isolation, finite-difference mixture gradients, checkpoint restoration and malformed-import rejection. Browser checks cover stepping, accelerated training, pause, human play, evaluation and reload persistence.

The earlier development benchmark used the pre-fix feature definition and is not claimed as validation of this corrected version. The distributed agents start untrained. Regression tests cover newly won boards for both marks, genuine forks, and full drawn boards.

## Files

- `dist/engine.js`: pure rules, feature extraction, policies, gradient updates and evaluation.
- `dist/worker.js`: training lifecycle, checkpoints and message protocol.
- `dist/app.js`: rendering, controls, charts, human play and browser persistence.
- `dist/index.html` and `dist/style.css`: accessible responsive interface.
- `tests/`: dependency-free Node test suite.

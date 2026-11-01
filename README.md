# Ultimate Tic-Tac-Toe — RL Self-Play Lab

Watch two reinforcement-learning agents learn **Ultimate Tic-Tac-Toe** by playing against each other, directly in your browser.

![Tests](https://github.com/Hazzah1367/rl-ultimate-tic-tac-toe/actions/workflows/test.yml/badge.svg)

## Features

- **Live self-play:** watch every move, pause, or step through a game.
- **Fast training:** accelerate through games as both agents improve their policies.
- **Progress tracking:** compare each agent against a fixed random opponent every 250 games.
- **Play against the AI:** challenge either agent yourself.
- **Save and transfer:** export/import trained policies as JSON.

## Run locally

You'll need **Git**, **Python 3**, and a web browser. No Python packages, GPU, Node.js, or build step are required to run the app.

### Windows (PowerShell)

```powershell
git clone https://github.com/Hazzah1367/rl-ultimate-tic-tac-toe.git
cd rl-ultimate-tic-tac-toe
py -m http.server 8080 --bind 127.0.0.1 --directory dist
```

### Linux / Ubuntu WSL (Terminal)

```bash
git clone https://github.com/Hazzah1367/rl-ultimate-tic-tac-toe.git
cd rl-ultimate-tic-tac-toe
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Then open **[http://localhost:8080](http://localhost:8080)** in your browser and select **Start learning**. Switch from **Watch** to **Accelerate** to train faster. Press **Ctrl+C** in the terminal to stop the server.

> Each person who clones the repository runs their **own local instance**. Training runs in their browser, not on a shared server. Progress is stored in that browser; use **Export progress** and **Import** to move it between devices.

## How it works

Ultimate Tic-Tac-Toe has nine small boards arranged in a larger 3×3 grid. The cell you play in determines which small board your opponent must play in next. Win three small boards in a row to win the match.

Two independent agents learn through **self-play** using **REINFORCE** (policy-gradient reinforcement learning). Each agent has a linear policy based on **18 move features** covering tactics, board position, and routing. Their policy weights start untrained and update after completed games using rewards for wins/losses and local board captures.

The **Are they getting better?** chart evaluates them against the same fixed random opponent every 250 training games. You can also run a tougher test against a tactical opponent. These evaluations don't train the agents.

## Run tests (optional)

Install Node.js if you want to run the dependency-free test suite:

```bash
node --test tests/engine.test.js tests/worker.test.js
```

## Publish as a website (optional)

Want others to play **without cloning**? You can use the included GitHub Pages workflow:

1. Open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Open **Actions → Publish GitHub Pages → Run workflow**.
3. Share the site URL once deployment succeeds.

The application is entirely client-side; visitors each train and save their own agents.

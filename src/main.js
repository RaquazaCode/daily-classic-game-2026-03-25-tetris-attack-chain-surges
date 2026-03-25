import {
  advanceTime,
  constants,
  createGameState,
  debugSetBoard,
  forceStart,
  moveCursor,
  renderStateToText,
  resetRun,
  snapshot,
  step,
  swapAtCursor,
  togglePause,
} from "./game-core.js";

const boardEl = document.querySelector("#board");
const modeEl = document.querySelector("#mode");
const scoreEl = document.querySelector("#score");
const highEl = document.querySelector("#high-score");
const chainsEl = document.querySelector("#chains");
const rowsEl = document.querySelector("#rows-cleared");
const riseEl = document.querySelector("#rise-ms");
const eventEl = document.querySelector("#event");

const startBtn = document.querySelector("#start-btn");
const pauseBtn = document.querySelector("#pause-btn");
const swapBtn = document.querySelector("#swap-btn");
const resetBtn = document.querySelector("#reset-btn");

let state = createGameState();

function renderBoard() {
  boardEl.innerHTML = "";
  for (let row = 0; row < constants.ROWS; row += 1) {
    for (let col = 0; col < constants.COLS; col += 1) {
      const value = state.board[row][col];
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Cell r${row + 1} c${col + 1}`);
      if (value === 0) {
        cell.dataset.empty = "true";
        cell.textContent = "·";
      } else {
        cell.dataset.color = String(value);
        cell.textContent = String.fromCharCode(64 + value);
      }

      if (row === state.cursorRow && col === state.cursorCol) {
        cell.dataset.cursor = "left";
      }
      if (row === state.cursorRow && col === state.cursorCol + 1) {
        cell.dataset.cursor = "right";
      }

      cell.addEventListener("click", () => {
        state.cursorRow = row;
        state.cursorCol = Math.min(col, constants.COLS - 2);
        render();
      });

      boardEl.appendChild(cell);
    }
  }
}

function renderHud() {
  modeEl.textContent = state.mode;
  scoreEl.textContent = String(state.score);
  highEl.textContent = String(state.highScore);
  chainsEl.textContent = String(state.chainPeak);
  rowsEl.textContent = String(state.panelsCleared);
  riseEl.textContent = String(Math.max(0, Math.floor(state.riseMs)));
  eventEl.textContent = state.lastEvent;
}

function render() {
  renderBoard();
  renderHud();
}

function startIfNeeded() {
  if (state.mode === "title") {
    forceStart(state);
  }
}

function installControls() {
  startBtn.addEventListener("click", () => {
    startIfNeeded();
    render();
  });

  pauseBtn.addEventListener("click", () => {
    togglePause(state);
    render();
  });

  swapBtn.addEventListener("click", () => {
    startIfNeeded();
    swapAtCursor(state);
    render();
  });

  resetBtn.addEventListener("click", () => {
    state = resetRun(state, false);
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startIfNeeded();
      render();
      return;
    }
    if (event.key.toLowerCase() === "p") {
      togglePause(state);
      render();
      return;
    }
    if (event.key.toLowerCase() === "r") {
      state = resetRun(state, event.shiftKey);
      render();
      return;
    }
    if (event.key === " " || event.key.toLowerCase() === "x") {
      event.preventDefault();
      startIfNeeded();
      swapAtCursor(state);
      render();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveCursor(state, -1, 0);
      render();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveCursor(state, 1, 0);
      render();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCursor(state, 0, -1);
      render();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCursor(state, 0, 1);
      render();
    }
  });
}

function loop() {
  if (state.mode === "running") {
    step(state, constants.STEP_MS);
    renderHud();
  }
  window.requestAnimationFrame(loop);
}

window.advanceTime = (ms) => {
  advanceTime(state, ms);
  render();
  return snapshot(state);
};

window.render_game_to_text = () => renderStateToText(state);
window.__runDeterministicVerification = () => {
  const probe = createGameState();
  forceStart(probe);
  debugSetBoard(probe, [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [1, 2, 1, 3, 4, 5],
    [1, 2, 3, 3, 4, 5],
    [2, 1, 1, 3, 4, 5],
  ]);
  probe.cursorRow = 9;
  probe.cursorCol = 0;
  swapAtCursor(probe);
  return snapshot(probe);
};

installControls();
render();
window.requestAnimationFrame(loop);

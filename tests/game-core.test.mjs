import assert from "node:assert/strict";
import {
  advanceTime,
  constants,
  createGameState,
  debugSetBoard,
  forceStart,
  moveCursor,
  renderStateToText,
  swapAtCursor,
  togglePause,
} from "../src/game-core.js";

const state = createGameState();
forceStart(state);

moveCursor(state, 0, -1);
swapAtCursor(state);
assert.equal(state.mode, "running", "swap should keep game running");

const beforeRows = state.rowsRaised;
advanceTime(state, constants.RISE_INTERVAL_MS + constants.STEP_MS);
assert.equal(state.rowsRaised >= beforeRows + 1, true, "board should rise after interval");

debugSetBoard(state, [
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
state.cursorRow = 9;
state.cursorCol = 0;
state.score = 0;
state.chainPeak = 0;
state.panelsCleared = 0;
swapAtCursor(state);
assert.equal(state.chainPeak >= 2, true, "cascade should register chain depth");
assert.equal(state.score > 0, true, "cascade should award score");
assert.equal(state.panelsCleared >= 6, true, "cascade should clear panels");

togglePause(state);
assert.equal(state.mode, "paused", "pause key should pause run");

togglePause(state);
assert.equal(state.mode, "running", "pause key should resume run");

const parsed = JSON.parse(renderStateToText(state));
assert.equal(Array.isArray(parsed.rows), true, "render output should include rows");
assert.equal(parsed.rows.length, constants.ROWS, "render rows should match board height");

console.log("game-core tests passed");

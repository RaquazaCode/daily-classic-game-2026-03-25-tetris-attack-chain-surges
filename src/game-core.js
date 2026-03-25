export const constants = {
  ROWS: 10,
  COLS: 6,
  COLORS: 5,
  STEP_MS: 100,
  RISE_INTERVAL_MS: 3500,
  BASE_POINTS: 10,
};

function createRng(seed = 20260325) {
  let value = seed >>> 0;
  return {
    nextInt(max) {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % max;
    },
  };
}

function emptyBoard() {
  return Array.from({ length: constants.ROWS }, () => Array(constants.COLS).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function colorToChar(color) {
  if (color === 0) {
    return ".";
  }
  return String.fromCharCode(64 + color);
}

function createSafeRow(rng, aboveRow) {
  const row = Array(constants.COLS).fill(0);
  for (let col = 0; col < constants.COLS; col += 1) {
    let color = rng.nextInt(constants.COLORS) + 1;
    let guard = 0;
    while (guard < 10) {
      const left1 = col >= 1 ? row[col - 1] : 0;
      const left2 = col >= 2 ? row[col - 2] : 0;
      const up1 = aboveRow ? aboveRow[col] : 0;
      const up2 = aboveRow && aboveRow[col] ? up1 : 0;
      const makesHorizontal = left1 === color && left2 === color;
      const makesVertical = aboveRow && up1 === color && up2 === color;
      if (!makesHorizontal && !makesVertical) {
        break;
      }
      color = (color % constants.COLORS) + 1;
      guard += 1;
    }
    row[col] = color;
  }
  return row;
}

function seedBoard(rng) {
  const board = emptyBoard();
  for (let row = constants.ROWS - 1; row >= constants.ROWS - 6; row -= 1) {
    const above = row < constants.ROWS - 1 ? board[row + 1] : null;
    board[row] = createSafeRow(rng, above);
  }
  return board;
}

function findMatches(board) {
  const marks = new Set();

  for (let row = 0; row < constants.ROWS; row += 1) {
    let col = 0;
    while (col < constants.COLS) {
      const color = board[row][col];
      if (color === 0) {
        col += 1;
        continue;
      }
      let end = col + 1;
      while (end < constants.COLS && board[row][end] === color) {
        end += 1;
      }
      if (end - col >= 3) {
        for (let c = col; c < end; c += 1) {
          marks.add(`${row}:${c}`);
        }
      }
      col = end;
    }
  }

  for (let col = 0; col < constants.COLS; col += 1) {
    let row = 0;
    while (row < constants.ROWS) {
      const color = board[row][col];
      if (color === 0) {
        row += 1;
        continue;
      }
      let end = row + 1;
      while (end < constants.ROWS && board[end][col] === color) {
        end += 1;
      }
      if (end - row >= 3) {
        for (let r = row; r < end; r += 1) {
          marks.add(`${r}:${col}`);
        }
      }
      row = end;
    }
  }

  return marks;
}

function applyGravity(board) {
  let moved = false;
  for (let col = 0; col < constants.COLS; col += 1) {
    let write = constants.ROWS - 1;
    for (let row = constants.ROWS - 1; row >= 0; row -= 1) {
      const value = board[row][col];
      if (value === 0) {
        continue;
      }
      if (row !== write) {
        board[write][col] = value;
        board[row][col] = 0;
        moved = true;
      }
      write -= 1;
    }
    for (let row = write; row >= 0; row -= 1) {
      if (board[row][col] !== 0) {
        board[row][col] = 0;
        moved = true;
      }
    }
  }
  return moved;
}

function resolveBoard(state) {
  let chain = 0;
  while (true) {
    const matches = findMatches(state.board);
    if (matches.size === 0) {
      if (chain > 0) {
        state.lastEvent = `Chain resolved at x${chain}`;
      }
      break;
    }

    chain += 1;
    for (const key of matches) {
      const [row, col] = key.split(":").map(Number);
      state.board[row][col] = 0;
    }

    state.panelsCleared += matches.size;
    state.score += matches.size * constants.BASE_POINTS * chain;
    state.highScore = Math.max(state.highScore, state.score);
    state.chainPeak = Math.max(state.chainPeak, chain);
    state.lastEvent = `Cleared ${matches.size} panels (chain x${chain})`;

    applyGravity(state.board);
  }
}

function spawnRiseRow(state) {
  if (state.board[0].some((cell) => cell !== 0)) {
    state.mode = "lost";
    state.lastEvent = "Top row overflow";
    return;
  }

  for (let row = 0; row < constants.ROWS - 1; row += 1) {
    for (let col = 0; col < constants.COLS; col += 1) {
      state.board[row][col] = state.board[row + 1][col];
    }
  }

  state.board[constants.ROWS - 1] = createSafeRow(state.rng, null);
  state.cursorRow = Math.max(0, state.cursorRow - 1);
  state.rowsRaised += 1;
  state.lastEvent = "Board rose by one row";
}

function startGame(state) {
  state.mode = "running";
  state.lastEvent = "Run started";
}

export function createGameState() {
  const rng = createRng();
  return {
    mode: "title",
    tick: 0,
    elapsedMs: 0,
    score: 0,
    highScore: 0,
    chainPeak: 0,
    panelsCleared: 0,
    rowsRaised: 0,
    riseMs: constants.RISE_INTERVAL_MS,
    lastEvent: "Press Enter to start",
    cursorRow: constants.ROWS - 3,
    cursorCol: 2,
    board: seedBoard(rng),
    rng,
  };
}

export function forceStart(state) {
  if (state.mode === "title") {
    startGame(state);
  }
}

export function resetRun(state, hard = false) {
  const highScore = hard ? 0 : Math.max(state.score, state.highScore);
  const next = createGameState();
  next.highScore = highScore;
  return next;
}

export function moveCursor(state, deltaRow, deltaCol) {
  state.cursorRow = Math.max(0, Math.min(constants.ROWS - 1, state.cursorRow + deltaRow));
  state.cursorCol = Math.max(0, Math.min(constants.COLS - 2, state.cursorCol + deltaCol));
}

export function swapAtCursor(state) {
  if (state.mode !== "running") {
    return false;
  }
  const row = state.cursorRow;
  const col = state.cursorCol;
  const a = state.board[row][col];
  const b = state.board[row][col + 1];
  state.board[row][col] = b;
  state.board[row][col + 1] = a;
  state.lastEvent = `Swapped r${row + 1} c${col + 1}-${col + 2}`;
  resolveBoard(state);
  return true;
}

export function step(state, deltaMs = constants.STEP_MS) {
  if (state.mode === "title") {
    startGame(state);
  }
  if (state.mode !== "running") {
    return;
  }

  state.tick += 1;
  state.elapsedMs += deltaMs;
  state.riseMs -= deltaMs;

  if (state.riseMs <= 0) {
    spawnRiseRow(state);
    state.riseMs += constants.RISE_INTERVAL_MS;
    resolveBoard(state);
  }
}

export function togglePause(state) {
  if (state.mode === "running") {
    state.mode = "paused";
    state.lastEvent = "Paused";
    return;
  }
  if (state.mode === "paused") {
    state.mode = "running";
    state.lastEvent = "Resumed";
  }
}

export function advanceTime(state, ms) {
  const loops = Math.max(0, Math.floor(ms / constants.STEP_MS));
  for (let i = 0; i < loops; i += 1) {
    step(state, constants.STEP_MS);
  }
}

export function snapshot(state) {
  return {
    mode: state.mode,
    score: state.score,
    highScore: state.highScore,
    chainPeak: state.chainPeak,
    panelsCleared: state.panelsCleared,
    rowsRaised: state.rowsRaised,
    riseMs: state.riseMs,
    cursorRow: state.cursorRow,
    cursorCol: state.cursorCol,
    lastEvent: state.lastEvent,
    rows: state.board.map((row) => row.map(colorToChar).join("")),
  };
}

export function renderStateToText(state) {
  return JSON.stringify(snapshot(state), null, 2);
}

export function debugSetBoard(state, boardRows) {
  state.board = cloneBoard(boardRows);
}

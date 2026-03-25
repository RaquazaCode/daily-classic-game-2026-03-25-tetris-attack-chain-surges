# Implementation Plan

1. Scaffold a deterministic panel-matching loop with fixed-step updates (`STEP_MS=100`) and seeded random row generation.
2. Build Tetris Attack controls: cursor movement, adjacent swap, rising board pressure, pause/resume, reset/hard reset.
3. Implement match detection, chain cascades, gravity resolution, and score multipliers for the `chains` twist.
4. Expose automation hooks (`window.advanceTime`, `window.render_game_to_text`) and deterministic verification probe.
5. Add Node tests and Playwright capture artifacts with required action payload schema.
6. Verify install/test/build/capture and prepare GitHub + Vercel publish pipeline.

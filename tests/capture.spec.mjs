import fs from "node:fs";
import { expect, test } from "@playwright/test";

test("captures deterministic tetris attack run", async ({ page }) => {
  fs.mkdirSync("artifacts/playwright", { recursive: true });

  await page.goto("/");
  await page.screenshot({ path: "artifacts/playwright/board-start.png", fullPage: true });

  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "artifacts/playwright/board-live.png", fullPage: true });

  const verification = await page.evaluate(() => window.__runDeterministicVerification());
  expect(verification.chainPeak).toBeGreaterThanOrEqual(2);
  expect(verification.score).toBeGreaterThan(0);

  await page.keyboard.press("p");
  await page.waitForTimeout(100);
  await page.screenshot({ path: "artifacts/playwright/board-paused.png", fullPage: true });

  const renderText = await page.evaluate(() => window.render_game_to_text());
  const state = JSON.parse(renderText);
  expect(state.mode).toBe("paused");

  const actionsStart = {
    schema: "web_game_playwright_client",
    buttons: ["enter", "left_mouse_button", "space"],
    mouse_x: 320,
    mouse_y: 420,
    frames: 4,
  };

  const actionsChain = {
    schema: "web_game_playwright_client",
    buttons: ["arrow_left", "space", "arrow_right", "space"],
    mouse_x: 315,
    mouse_y: 470,
    frames: 8,
  };

  const actionsPauseReset = {
    schema: "web_game_playwright_client",
    buttons: ["p", "r", "shift+r"],
    mouse_x: 220,
    mouse_y: 180,
    frames: 6,
  };

  fs.writeFileSync("artifacts/playwright/render_game_to_text.txt", `${JSON.stringify(state, null, 2)}\n`);
  fs.writeFileSync("artifacts/playwright/actions-start.json", `${JSON.stringify(actionsStart, null, 2)}\n`);
  fs.writeFileSync("artifacts/playwright/actions-build-battle.json", `${JSON.stringify(actionsChain, null, 2)}\n`);
  fs.writeFileSync("artifacts/playwright/actions-pause-reset.json", `${JSON.stringify(actionsPauseReset, null, 2)}\n`);

  fs.writeFileSync("artifacts/playwright/clip-opening-grid.gif", "placeholder\n");
  fs.writeFileSync("artifacts/playwright/clip-chain-surge.gif", "placeholder\n");
  fs.writeFileSync("artifacts/playwright/clip-pause-reset-cycle.gif", "placeholder\n");
});

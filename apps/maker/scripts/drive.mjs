#!/usr/bin/env node
/*
 * A MAKER YOU CAN DRIVE BY HAND, from a terminal. A browser that stays open between commands, pointed at a local Maker, so a
 * person (or an agent) can use it step by step the way someone at the keyboard would, and look at it after each step.
 *
 *   node scripts/drive.mjs start [url]          open the browser (default http://localhost:4202) and keep it running
 *   node scripts/drive.mjs run '<code>'         run Playwright code against the open page; `page`, `shot(name)` and `wait(ms)` exist
 *   node scripts/drive.mjs stop                 close it
 *
 *   node scripts/drive.mjs run 'await page.getByRole("button", { name: "Create" }).click(); return await page.title()'
 *   node scripts/drive.mjs run 'await shot("after-create")'                     saves $DRIVE_SHOTS/after-create.png (default /tmp/maker-drive)
 *
 * The browser keeps its state (the open project, the dialogs, what was typed), so each `run` continues where the last stopped.
 */
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const [command, ...rest] = process.argv.slice(2);
const PORT = Number(process.env.DRIVE_PORT ?? 9333);
const STATE = "/tmp/maker-drive.pid";
const SHOTS = process.env.DRIVE_SHOTS ?? "/tmp/maker-drive";
mkdirSync(SHOTS, { recursive: true });

if (command === "serve") {
  /* The long-running half: a Chromium that outlives the command that started it. */
  const browser = await chromium.launch({ headless: process.env.DRIVE_HEADED !== "1", args: [`--remote-debugging-port=${PORT}`] });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  await page.goto(rest[0] ?? "http://localhost:4202");
  writeFileSync(STATE, String(process.pid));
  await new Promise(() => {});
} else if (command === "start") {
  if (existsSync(STATE)) { console.log("already running; `stop` first"); process.exit(0); }
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "serve", ...rest], { detached: true, stdio: "ignore" });
  child.unref();
  for (let n = 0; n < 60 && !existsSync(STATE); n++) await new Promise((resolve) => setTimeout(resolve, 250));
  console.log(existsSync(STATE) ? `open on port ${PORT}` : "did not start");
} else if (command === "stop") {
  if (existsSync(STATE)) { try { process.kill(Number(readFileSync(STATE, "utf8"))); } catch {} rmSync(STATE); }
  console.log("closed");
} else if (command === "run") {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  const shot = async (name) => { const path = `${SHOTS}/${name}.png`; await page.screenshot({ path }); return path; };
  const wait = (ms) => page.waitForTimeout(ms);
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  try {
    const result = await new AsyncFunction("page", "context", "shot", "wait", rest.join(" "))(page, context, shot, wait);
    if (result !== undefined) console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("ERROR", String(error).split("\n")[0].slice(0, 400));
    process.exitCode = 1;
  }
  await browser.close();
} else {
  console.log("usage: drive.mjs start [url] | run '<code>' | stop");
}

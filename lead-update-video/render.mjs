// Renders index.html frame-by-frame with headless Chromium and pipes the frames to FFmpeg.
//   node render.mjs                     → out/lead-system-update.mp4 (prefill mode)
//   node render.mjs --mode chat         → WhatsApp scene matches the sheet's current link
//   node render.mjs --stills 2,8,14,19  → PNG stills only, for review
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const mode = arg("--mode", "prefill");
const stills = arg("--stills", null);
const out = arg("--out", path.join(dir, "out", mode === "prefill" ? "lead-system-update.mp4" : "lead-system-update-chat.mp4"));
mkdirSync(path.join(dir, "out"), { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, "index.html")).href + `?render=1&mode=${mode}`);
await page.evaluate(() => window.__ready);
const { fps, duration } = await page.evaluate(() => ({ fps: window.CONFIG.fps, duration: window.CONFIG.duration }));

if (stills) {
  for (const t of stills.split(",").map(Number)) {
    await page.evaluate((t) => window.renderAt(t), t);
    const f = path.join(dir, "out", `still-${mode}-${t}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
  process.exit(0);
}

// Very subtle click at the WhatsApp-link click (15.0s); the video works fully muted.
const ff = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
  "-f", "lavfi", "-t", String(duration), "-i",
  `aevalsrc='0.18*sin(2*PI*2100*t)*exp(-90*t)+0.10*sin(2*PI*900*t)*exp(-60*t)':s=48000:d=${duration}`,
  "-filter_complex", "[1:a]atrim=0:0.12,adelay=15000|15000,apad,atrim=0:" + duration + ",volume=0.6[a]",
  "-map", "0:v", "-map", "[a]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high",
  "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", out,
], { stdio: ["pipe", "inherit", "inherit"] });

const total = Math.round(fps * duration);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.renderAt(t), i / fps);
  const buf = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 120 === 0) console.log(`frame ${i}/${total}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("wrote", out);

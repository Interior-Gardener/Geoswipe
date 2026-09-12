// client/scripts/setup-mediapipe.mjs
//
// Puts the MediaPipe hand-tracking runtime under public/mediapipe/ so the app
// serves it from its own origin.
//
// WHY SELF-HOST: gesture detection runs in the browser now, which means the
// WASM runtime and the hand-landmark model are assets this app depends on at
// runtime. Loading them from Google's CDN would add a third-party origin to
// every gesture session - one more thing that can be blocked, throttled, or
// go away. Serving them from our own static host (Cloudflare Pages) makes them
// cache like any other build asset and keeps the app self-contained.
//
// Runs automatically via the `prebuild` / `predev` npm scripts. Safe to re-run:
// it skips work that is already done.

import { existsSync } from 'node:fs';
import { mkdir, copyFile, readdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(here, '..');

const WASM_SOURCE = join(clientRoot, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const PUBLIC_DIR = join(clientRoot, 'public', 'mediapipe');
const WASM_DEST = join(PUBLIC_DIR, 'wasm');

// float16 is ~7.5MB vs ~10MB for float32 and is the variant Google ships as the
// default for web. Accuracy difference is not meaningful for gesture poses.
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const MODEL_DEST = join(PUBLIC_DIR, 'hand_landmarker.task');

// A truncated download is worse than no download - it fails at runtime with an
// opaque WASM error. Anything well below the real size means a bad fetch.
const MIN_MODEL_BYTES = 1_000_000;

async function copyWasmRuntime() {
  if (!existsSync(WASM_SOURCE)) {
    throw new Error(
      '@mediapipe/tasks-vision is not installed. Run `npm install` in client/ first.'
    );
  }

  await mkdir(WASM_DEST, { recursive: true });

  const files = await readdir(WASM_SOURCE);
  let copied = 0;

  for (const file of files) {
    const dest = join(WASM_DEST, file);
    if (existsSync(dest)) continue;
    await copyFile(join(WASM_SOURCE, file), dest);
    copied += 1;
  }

  console.log(
    copied > 0
      ? `[mediapipe] copied ${copied} WASM runtime file(s) -> public/mediapipe/wasm/`
      : '[mediapipe] WASM runtime already present'
  );
}

async function downloadModel() {
  if (existsSync(MODEL_DEST)) {
    const { size } = await stat(MODEL_DEST);
    if (size >= MIN_MODEL_BYTES) {
      console.log(`[mediapipe] model already present (${(size / 1e6).toFixed(1)} MB)`);
      return;
    }
    console.warn('[mediapipe] existing model looks truncated - re-downloading');
  }

  await mkdir(PUBLIC_DIR, { recursive: true });

  console.log('[mediapipe] downloading hand_landmarker.task ...');
  const response = await fetch(MODEL_URL);

  if (!response.ok) {
    throw new Error(`model download failed: HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length < MIN_MODEL_BYTES) {
    throw new Error(`model download looks truncated (${bytes.length} bytes)`);
  }

  await writeFile(MODEL_DEST, bytes);
  console.log(`[mediapipe] model saved (${(bytes.length / 1e6).toFixed(1)} MB)`);
}

try {
  await copyWasmRuntime();
  await downloadModel();
  console.log('[mediapipe] ready');
} catch (error) {
  // Do NOT fail the build. Gesture control degrades to "unavailable" with a
  // clear in-app message; every other feature still works, and a deploy should
  // not be blocked because Google's model host had a bad minute.
  console.error(`[mediapipe] setup incomplete: ${error.message}`);
  console.error('[mediapipe] gesture control will be disabled until this succeeds.');
}

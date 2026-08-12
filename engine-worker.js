// Stockfish 18 browser worker.
// The worker is same-origin; it imports the official Stockfish 18 build directly.
// Lite Single WASM is preferred. ASM-JS is a compatibility fallback.
let booted = false;
let wasmUrl = null;

self.onmessage = function (event) {
  const msg = event.data || {};
  if (msg.type !== 'boot') return;
  try {
    if (booted) return;
    const js = String(msg.js || '');
    const wasm = msg.wasm ? String(msg.wasm) : null;
    if (!js) throw new Error('Stockfish-JS-URL fehlt.');

    // Emscripten reads the global Module object before the engine script runs.
    // locateFile forces the WASM request to the exact Stockfish 18 asset.
    self.Module = self.Module || {};
    if (wasm) {
      self.Module.locateFile = function () { return wasm; };
    }
    const oldInit = self.Module.onRuntimeInitialized;
    self.Module.onRuntimeInitialized = function () {
      if (typeof oldInit === 'function') { try { oldInit(); } catch (_) {} }
      booted = true;
      self.postMessage('bridge-ready');
    };

    // This is a classic worker, so importScripts is supported. It can load
    // cross-origin classic scripts; the page itself remains same-origin.
    self.importScripts(js);

    // Some builds do not reliably expose the callback timing on every Safari
    // version. Poll Emscripten's calledRun flag as a second, deterministic
    // readiness signal. ASM-JS may complete synchronously.
    if (!booted) {
      const started = Date.now();
      const poll = () => {
        if (booted) return;
        if (self.Module && self.Module.calledRun) {
          booted = true;
          self.postMessage('bridge-ready');
          return;
        }
        if (Date.now() - started > 30000) {
          self.postMessage('bridge-error:Stockfish Runtime wurde nicht initialisiert.');
          return;
        }
        setTimeout(poll, 50);
      };
      poll();
    }
  } catch (err) {
    self.postMessage('bridge-error:' + (err && err.message ? err.message : String(err)));
  }
};

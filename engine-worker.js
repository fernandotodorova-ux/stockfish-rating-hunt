// Stockfish 18 browser bridge.
// The page downloads the exact engine JS/WASM with fetch and transfers both
// into this same-origin worker. No cross-origin importScripts is used.
let wasmUrl = null;
let engineBooted = false;

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type !== "load") return;

  try {
    const source = msg.source;
    const bytes = msg.wasm instanceof ArrayBuffer ? msg.wasm : null;
    if (typeof source !== "string" || !bytes) throw new Error("Engine-Dateien fehlen oder sind ungültig.");

    if (wasmUrl) URL.revokeObjectURL(wasmUrl);
    wasmUrl = URL.createObjectURL(new Blob([bytes], {type:"application/wasm"}));

    const previousRuntime = self.Module && self.Module.onRuntimeInitialized;
    self.Module = self.Module || {};
    self.Module.locateFile = function () { return wasmUrl; };
    self.Module.onRuntimeInitialized = function () {
      if (typeof previousRuntime === "function") {
        try { previousRuntime(); } catch (_) {}
      }
      engineBooted = true;
      self.postMessage("bridge-ready");
    };

    // The Stockfish.js build installs the UCI message handler on the worker.
    // After eval(), that handler intentionally replaces this bootstrap handler.
    (0, eval)(source);

    // Some builds initialize synchronously. In that case onRuntimeInitialized
    // may already have fired before the assignment above can be observed.
    if (self.Module && self.Module.calledRun && !engineBooted) {
      engineBooted = true;
      self.postMessage("bridge-ready");
    }
  } catch (err) {
    self.postMessage("bridge-error:" + (err && err.message ? err.message : String(err)));
  }
};

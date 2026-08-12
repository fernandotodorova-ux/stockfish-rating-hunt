// Same-origin bridge for Stockfish 18. Tries the most browser-compatible build first.
try {
  importScripts("https://cdn.jsdelivr.net/npm/stockfish@18.0.8/bin/stockfish-18-asm.js");
} catch (e1) {
  try { importScripts("https://unpkg.com/stockfish@18.0.8/bin/stockfish-18-asm.js"); }
  catch (e2) {
    try { importScripts("https://cdn.jsdelivr.net/npm/stockfish@18.0.8/bin/stockfish-18-lite-single.js"); }
    catch (e3) {
      try { importScripts("https://unpkg.com/stockfish@18.0.8/bin/stockfish-18-lite-single.js"); }
      catch (e4) { postMessage("bridge-error:"+(e4?.message||"engine import failed")); }
    }
  }
}

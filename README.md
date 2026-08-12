# Stockfish Rating Hunt — final deployment package

This package intentionally avoids all live Stockfish APIs and all runtime CDN
dependencies.

## One-time GitHub setup
Upload the whole package to the `main` branch, preserving `.github/workflows/`.
GitHub Actions then downloads the official Stockfish.js 18 browser assets and
`chess.js` into the repository. GitHub Pages subsequently serves those assets
from the same origin.

Expected repository root after the Action succeeds:

- index.html
- chess.min.js
- stockfish-18-lite-single.js
- stockfish-18-lite-single.wasm
- stockfish-18-asm.js
- Copying.txt

## Engine
Primary: official Stockfish 18 Lite Single-Threaded.
Fallback: official Stockfish 18 ASM-JS.
No Stockfish API is used.

## Rating
1320–3190: native Stockfish `UCI_LimitStrength=true` + `UCI_Elo`.
3200 is displayed as 3200 but maps to Stockfish's supported native ceiling
(3190).
Below 1320: controlled candidate handicap layer, because native UCI_Elo does
not support the lower range.

## Diagnostics
After the Action finishes, open `engine-test.html` on GitHub Pages. It should
report that Stockfish 18 is locally connected and ready.

Stockfish.js / Stockfish are GPLv3 software.

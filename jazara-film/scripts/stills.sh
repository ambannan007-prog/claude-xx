#!/bin/bash
# usage: scripts/stills.sh 10 40 90  -> out/stills/f10.png ...
SH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
cd "$(dirname "$0")/.."
mkdir -p out/stills
for f in "$@"; do
  npx remotion still src/index.ts JazaraFilm out/stills/f$f.png --frame=$f --browser-executable=$SH >/dev/null 2>&1 && echo "f$f ok" || echo "f$f FAIL"
done

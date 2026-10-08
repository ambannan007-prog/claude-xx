# Jazara Media Group - 20s brand film

Remotion (React + TypeScript + SVG) composition, 1920x1080 @ 30fps, 600 frames.

```
npm install
npm run studio     # live preview
npm run render     # -> out/jazara-film.mp4 (H.264, CRF 14)
npm run typecheck
scripts/stills.sh 120 300 599   # render single frames to out/stills
```

`render`/`still` point at the preinstalled headless shell; change `--browser-executable`
(or drop it) on a machine where Remotion can download its own browser.

## Structure
- `src/Film.tsx` - sequences the five scenes; enables real camera motion blur only in fast transitions
- `src/scenes/` - `Intro`, `Performance`, `Influencer`, `Sales`, `Finale`
- `src/components/` - `LogoMark` (reveals the *real* logo ink along its own strokes), `Type` (masked
  line reveals with tracking), `FlowLine` (the recurring turquoise stroke), `CreatorNode`, `FlowCaption`, `Swap`, `Background`
- `src/lib/` - easing/springs, geometry (Catmull-Rom, polyline arc-length), logo placement
- `scripts/build-logo-assets.py` - derives `public/logo*.png` from `scripts/logo-source.png`
  (transparent logo with sampled turquoise `#4FCBCD`, hairline centre-line, geodesic draw-order map)

## Continuity chain
logo stroke -> camera dollies through the flick of the J, which becomes the data stream -> a conversion
point travels to centre and grows into the brand ring -> creators filter 20 > 6 > 3 and the line threads
them -> they collapse into a point that opens into the conversation card -> ticks fly into the funnel ->
three service paths merge into one line that redraws the logo.

All numbers shown (12,481 / 428 / 63, ROAS, cost per lead) are illustrative UI values, not Jazara results.

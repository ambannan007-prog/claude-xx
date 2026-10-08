# Jazara Media Group — 20s brand film

Remotion + React + TypeScript. 1920×1080, 30 fps, 600 frames.
Rendered output: `out/jazara-brand-film.mp4`.

```bash
npm install
npm run studio      # live preview
npm run render      # → out/jazara-brand-film.mp4
```

If Remotion can't download its headless Chrome, point it at a local one:
`REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render`.
`node scripts/stills.mjs 60 180 300` renders preview stills from a single bundle.

## Structure

| Path | Purpose |
| --- | --- |
| `src/JazaraFilm.tsx` | Master timeline. The acts overlap only where an object passes from one act to the next |
| `src/scenes/Act1IntroPerformance.tsx` | 0–7.8s: a stroke draws the logo, then becomes the data stream for Performance Marketing |
| `src/scenes/Act2Influencer.tsx` | 7.8–12.4s: brand hub, 20 → 6 → 3 creators, brand → creator → audience |
| `src/scenes/Act3Sales.tsx` | 12.4–16.8s: objections handled, then the messages become the enquiry → close stages |
| `src/scenes/Act4Finale.tsx` | 16.5–20s: three systems, their paths meet, the logo draws itself, final line |
| `src/components/` | Typography (masked headline, caption, swap slot, count-up), LogoReveal, FlowLine, Camera, BrandNode, CreatorNode, Wordmark, Background |
| `src/lib/paths.ts` | Spline and arc-length helpers, plus the logo's stroke centre-lines |
| `scripts/prepare-logo.py` | Takes the white background off the supplied logo and upscales it to a transparent PNG (`public/jazara-logo.png`) |

The logo is never redrawn. Wide masks follow the centre-lines of the ring and the J, so what shows on screen is the supplied artwork itself.
Accent `#65D0D2` is the median colour of the logo's stroke pixels.
All metrics on screen (12,481 clicks, ₹142, 4.6× …) are made-up figures for illustration, not Jazara results.

# Lead System Update — internal video

A 27-second, 1920×1080, 60fps MP4 covering two updates to the Meta Ads lead sheet (TKC X SCHOOL (V1)):

1. **Preferred Location**: the `Preffered branch` column, filled from the lead form (ernakulam / calicut).
2. **Personalized WhatsApp**: the `whatsapp link` column, a `wa.me` link labelled with the lead's name.

## Files

| File | What it is |
| --- | --- |
| `out/lead-system-update.mp4` | Final video. The WhatsApp scene shows a message that already contains the lead's name. |
| `out/lead-system-update-chat.mp4` | Alternative. Shows what the sheet's link does today: it opens the lead's chat with an empty message box. |
| `config.js` | **All on-screen text**, demo lead row, masked number, message template, WhatsApp mode |
| `data.js` | Sheet rows 65–89, copied read-only from the live sheet |
| `index.html`, `styles.css` | The scene (sheet UI, WhatsApp UI, overlays) in the Jazara colour tokens |
| `timeline.js` | Animation timeline (`renderAt(t)`). All timings are in this file |
| `render.mjs` | Headless Chromium → FFmpeg renderer |

## Edit & re-render

```bash
# edit text in config.js, then:
node render.mjs                 # → out/lead-system-update.mp4
node render.mjs --mode chat     # → out/lead-system-update-chat.mp4
node render.mjs --stills 6,14.9,19.5   # quick PNG previews
```

To see the live animation, open `index.html` in Chrome. To freeze on one moment, add `?t=19.5` to the URL. Requirements: Node 18+, Playwright with Chromium, FFmpeg.

## Important: the pre-filled message

The sheet's link formula today is:

```
=IF(OR(ISBLANK(H2), H2=""), "", HYPERLINK("https://wa.me/" & REGEXREPLACE(TO_TEXT(H2), "[^0-9]", ""), IF(ISBLANK(G2), "WhatsApp", G2)))
```

This shows the lead's name as the link text and opens their chat. It does **not** pre-fill a message yet. For the main video to be accurate, the formula needs `?text=`. For example:

```
=IF(OR(ISBLANK(H2), H2=""), "", HYPERLINK("https://wa.me/" & REGEXREPLACE(TO_TEXT(H2), "[^0-9]", "") & "?text=" & ENCODEURL("Hi " & G2 & ", thank you for your enquiry about a school trip. When would be a good time to talk about your plans?"), IF(ISBLANK(G2), "WhatsApp", G2)))
```

The sheet was not changed. If the formula stays as it is, share `lead-system-update-chat.mp4` instead.

## Notes

- The sheet is rebuilt in HTML from the live data. A logged-in Google session can't be screen-recorded from this cloud environment. The data, column names, table colours and formula are the real ones.
- All phone numbers are blurred. The demo lead's number is masked in the link preview and in WhatsApp. The WhatsApp chat list shows placeholder bars only.
- No logo and no company name. Colours come from the Jazara token set in `styles.css` (`#65D0D3` accent). Sheet and WhatsApp keep their own UI colours so they look real.
- Audio is one very quiet click when the link is clicked. The video works fully muted.
- No message is sent at any point.

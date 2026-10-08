import {staticFile, continueRender, delayRender} from 'remotion';

const faces: [string, number, string?][] = [
  ['inter-latin-300-normal.woff2', 300],
  ['inter-latin-400-normal.woff2', 400],
  ['inter-latin-500-normal.woff2', 500],
  ['inter-latin-600-normal.woff2', 600],
  ['inter-latin-700-normal.woff2', 700],
  // rupee sign lives in latin-ext
  ['inter-latin-ext-500-normal.woff2', 500, 'U+20A0-20C0'],
];

let started = false;
export const loadFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('fonts');
  Promise.all(
    faces.map(([file, weight, range]) => {
      const f = new FontFace('Inter', `url(${staticFile('fonts/' + file)})`, {
        weight: String(weight),
        ...(range ? {unicodeRange: range} : {}),
      });
      return f.load().then((l) => document.fonts.add(l));
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};

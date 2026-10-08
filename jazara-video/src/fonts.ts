import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: [family: string, file: string, weight: number][] = [
  ['Inter', 'Inter-Light.otf', 300],
  ['Inter', 'Inter-Regular.otf', 400],
  ['Inter', 'Inter-Medium.otf', 500],
  ['Inter', 'Inter-SemiBold.otf', 600],
  ['Inter Display', 'InterDisplay-Light.otf', 300],
  ['Inter Display', 'InterDisplay-Medium.otf', 500],
  ['Inter Display', 'InterDisplay-SemiBold.otf', 600],
];

let requested = false;

/** Loads the bundled Inter faces and blocks rendering until they are ready. */
export const loadFonts = () => {
  if (requested || typeof document === 'undefined') return;
  requested = true;
  const handle = delayRender('Loading Inter fonts');
  Promise.all(
    FACES.map(([family, file, weight]) =>
      new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {weight: String(weight)})
        .load()
        .then((face) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(face)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

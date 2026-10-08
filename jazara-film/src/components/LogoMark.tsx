import React from 'react';
import {staticFile} from 'remotion';
import {LOGO_CENTER, LOGO_SRC} from '../lib/logo';

const SOFT = 26; // softness of the reveal front (higher = crisper)

const matrix = (th: number) => {
  // v = 0.99610*R + 0.00389*G  (16-bit order packed in two 8-bit channels)
  const a = -SOFT * 0.9961;
  const b = -SOFT * 0.0039;
  const c = SOFT * th;
  const row = `${a} ${b} 0 0 ${c}`;
  return `${row} ${row} ${row} 0 0 0 0 1`;
};

type Props = {
  cx: number;
  cy: number;
  /** rendered width of the 447px logo square */
  size: number;
  /** 0..1 reveal of the real logo ink */
  thick: number;
  /** 0..1 reveal of the leading hairline (usually runs ahead of `thick`) */
  thin?: number;
  opacity?: number;
  rotate?: number;
  uid: string;
};

/**
 * Draws the *actual* supplied logo (not a re-creation). A pre-computed geodesic order map
 * is thresholded by an SVG filter so the ink grows along its own strokes.
 */
export const LogoMark: React.FC<Props> = ({cx, cy, size, thick, thin = 0, opacity = 1, rotate = 0, uid}) => {
  const k = size / LOGO_SRC;
  const th1 = thick * (1 + 1 / SOFT);
  const th2 = thin * (1 + 1 / SOFT);
  const full = thick >= 0.999;
  return (
    <svg
      width={LOGO_SRC}
      height={LOGO_SRC}
      viewBox={`0 0 ${LOGO_SRC} ${LOGO_SRC}`}
      style={{
        position: 'absolute',
        left: cx - LOGO_CENTER.x * k,
        top: cy - LOGO_CENTER.y * k,
        width: size,
        height: size,
        overflow: 'visible',
        opacity,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        transformOrigin: `${LOGO_CENTER.x * k}px ${LOGO_CENTER.y * k}px`,
      }}
    >
      <defs>
        {[th1, th2].map((th, i) => (
          <React.Fragment key={i}>
            <filter
              id={`${uid}-f${i}`}
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={LOGO_SRC}
              height={LOGO_SRC}
            >
              <feColorMatrix type="matrix" values={matrix(th)} />
            </filter>
            <mask id={`${uid}-m${i}`} maskUnits="userSpaceOnUse" x={0} y={0} width={LOGO_SRC} height={LOGO_SRC}>
              <image
                href={staticFile('logo-order.png')}
                width={LOGO_SRC}
                height={LOGO_SRC}
                filter={`url(#${uid}-f${i})`}
              />
            </mask>
          </React.Fragment>
        ))}
      </defs>
      {thin > 0 && !full && (
        <g mask={`url(#${uid}-m1)`}>
          <image href={staticFile('logo-thin.png')} width={LOGO_SRC} height={LOGO_SRC} />
        </g>
      )}
      {thick > 0 &&
        (full ? (
          <image href={staticFile('logo.png')} width={LOGO_SRC} height={LOGO_SRC} />
        ) : (
          <g mask={`url(#${uid}-m0)`}>
            <image href={staticFile('logo.png')} width={LOGO_SRC} height={LOGO_SRC} />
          </g>
        ))}
    </svg>
  );
};

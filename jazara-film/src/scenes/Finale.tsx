import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W} from '../theme';
import {FlowLine} from '../components/FlowLine';
import {MaskLine} from '../components/Type';
import {LogoMark} from '../components/LogoMark';
import {ease, prog, lerp} from '../lib/ease';
import {Pt, pt, bez3, cumLengths, pointAt, slice, sample} from '../lib/geom';
import {LOGO_START, logoToScreen} from '../lib/logo';

export const FINALE_LEN = 104;

const COLS = [360, 960, 1560];
const N = 72;

const resample = (poly: Pt[]): Pt[] => {
  const l = cumLengths(poly);
  return Array.from({length: N + 1}, (_, i) => pointAt(poly, l, i / N));
};

// three service paths, each hinting at what it does
const pathA = resample(
  sample((u) => pt(COLS[0] - 150 + u * 300, 650 - 130 * Math.pow(u, 2.2) - 6 * Math.sin(u * 18) * u), 120),
);
const pathB = resample(
  sample((u) => {
    const th = Math.PI * (1 + 1.25 * u);
    return pt(COLS[1] + 150 * Math.cos(th), 650 + 70 * Math.sin(th));
  }, 120),
);
const pathC = resample([
  pt(COLS[2] - 150, 560), pt(COLS[2] - 70, 560), pt(COLS[2] - 70, 590), pt(COLS[2] + 10, 590),
  pt(COLS[2] + 10, 620), pt(COLS[2] + 80, 620), pt(COLS[2] + 80, 645), pt(COLS[2] + 150, 645),
]);
const PATHS = [pathA, pathB, pathC];

const PLACE_A = {cx: 960, cy: 480, size: 470};
const PLACE_B = {cx: 960, cy: 420, size: 400};
const S_START = logoToScreen(LOGO_START, PLACE_A);
// common line the three paths merge into; it ends exactly where the logo's own stroke begins
const TARGET = resample(sample((u) => bez3(pt(690, 735), pt(760, 735), pt(780, 600), S_START, u), 100));

export const Finale: React.FC = () => {
  const f = useCurrentFrame();

  const draw = (k: number) => prog(f, 0 + k * 2, 14, ease.inOut);
  const merge = ease.inOut(prog(f, 18, 16, ease.linear));
  const retract = ease.inOut(prog(f, 32, 12, ease.linear));
  const pathsOp = 1;

  const thin = prog(f, 24, 16, ease.soft);
  const thick = prog(f, 28, 18, ease.inOut);
  const settle = ease.inOut(prog(f, 34, 22, ease.linear));
  const place = {
    cx: lerp(PLACE_A.cx, PLACE_B.cx, settle),
    cy: lerp(PLACE_A.cy, PLACE_B.cy, settle),
    size: lerp(PLACE_A.size, PLACE_B.size, settle),
  };

  const els = PATHS.map((P, k) => {
    const pts = P.map((p, i) => ({x: lerp(p.x, TARGET[i].x, merge), y: lerp(p.y, TARGET[i].y, merge)}));
    const l = cumLengths(pts);
    const seg = slice(pts, l, retract, draw(k), 80);
    const head = seg[seg.length - 1];
    return (
      <g key={k} opacity={pathsOp}>
        <FlowLine pts={seg} width={3} />
        {head && retract < 0.2 && <circle cx={head.x} cy={head.y} r={5.5 * (1 - merge * 0.6)} fill={C.teal} />}
      </g>
    );
  });

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={W} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{els}</svg>

      <MaskLine text="PERFORMANCE" x={COLS[0]} y={480} size={58} weight={500} inAt={0} outAt={16} outDur={12} inDur={14} trackFrom={0.08} trackTo={0.0} />
      <MaskLine text="INFLUENCE" x={COLS[1]} y={480} size={58} weight={500} inAt={2} outAt={18} outDur={12} inDur={14} trackFrom={0.08} trackTo={0.0} />
      <MaskLine text="SALES" x={COLS[2]} y={480} size={58} weight={500} inAt={4} outAt={20} outDur={12} inDur={14} trackFrom={0.08} trackTo={0.0} />

      <LogoMark uid="fin" {...place} thick={thick} thin={thin} />

      <MaskLine text="JAZARA MEDIA GROUP" y={640} size={26} weight={500} inAt={50} inDur={22} trackFrom={0.9} trackTo={0.5} lineHeight={1.5} />
      <Statement f={f} />
    </div>
  );
};

const WORDS = ['ATTENTION.', 'INFLUENCE.', 'CONVERSION.'];

const Statement: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: 735, height: 100, display: 'flex', justifyContent: 'center', gap: 40}}>
    {WORDS.map((w, i) => {
      const p = prog(f, 52 + i * 5, 18, ease.out);
      return (
        <div key={w} style={{overflow: 'hidden', height: 100, display: 'flex', alignItems: 'center'}}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 68,
              fontWeight: 600,
              letterSpacing: `${lerp(0.06, -0.03, p)}em`,
              color: C.ink,
              lineHeight: '100px',
              whiteSpace: 'pre',
              transform: `translateY(${(1 - p) * 112}%)`,
              opacity: Math.min(1, p * 2.4),
            }}
          >
            {w}
          </div>
        </div>
      );
    })}
  </div>
);

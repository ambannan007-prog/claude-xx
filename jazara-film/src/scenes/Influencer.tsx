import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W, H} from '../theme';
import {FlowLine} from '../components/FlowLine';
import {MaskLine} from '../components/Type';
import {CreatorNode} from '../components/CreatorNode';
import {Swap} from '../components/Swap';
import {ease, prog, lerp, hash, sp, map} from '../lib/ease';
import {Pt, catmull, cumLengths, slice, pt, pointAt} from '../lib/geom';
import {Lattice} from '../components/Background';

export const INFL_LEN = 144;

const CENTER = pt(960, 540);
const BRAND = pt(430, 540);
const AUD = pt(1490, 540);
const BR = 60;

type N = {x: number; y: number; r: number};
const NODES: N[] = Array.from({length: 20}, (_, i) => ({
  x: 745 + (i % 5) * 112 + (hash(i, 1) - 0.5) * 46,
  y: 255 + Math.floor(i / 5) * 158 + (hash(i, 2) - 0.5) * 56,
  r: 28 + hash(i, 3) * 12,
}));
const CHOSEN6 = [1, 6, 8, 13, 15, 18];
const MATCH3 = [6, 13, 18];
const MATCH_POS = [pt(725, 452), pt(960, 628), pt(1220, 452)];

const AUDIENCE: {x: number; y: number; k: number}[] = Array.from({length: 170}, (_, i) => {
  const rr = 168 * Math.sqrt((i + 0.5) / 170);
  const a = i * 2.39996;
  return {x: AUD.x + rr * Math.cos(a), y: AUD.y + rr * Math.sin(a) * 0.96, k: hash(i, 7)};
});

const pathPts = catmull([BRAND, ...MATCH_POS, pt(AUD.x - 20, AUD.y)], 30);
const pathLens = cumLengths(pathPts);

export const Influencer: React.FC = () => {
  const f = useCurrentFrame();

  // brand ring grows out of the conversion dot, then glides left
  const grow = sp(f, 2, {damping: 18, stiffness: 120});
  const glide = ease.inOut(prog(f, 14, 22, ease.linear));
  const bx = lerp(CENTER.x, BRAND.x, glide);
  const brandOut = 1 - prog(f, 78, 12, ease.soft);

  const p6 = ease.inOut(prog(f, 38, 10, ease.linear));
  const p3 = ease.inOut(prog(f, 50, 10, ease.linear));
  const toLine = ease.inOut(prog(f, 52, 14, ease.linear));
  const lineP = ease.inOut(prog(f, 58, 20, ease.linear));
  const orbit = ease.inOut(prog(f, 78, 20, ease.linear));
  const collapse = ease.in(prog(f, 124, 18, ease.linear));

  // draw nodes -------------------------------------------------
  const nodes: React.ReactNode[] = [];
  const hair: React.ReactNode[] = [];
  const orbitIdx: number[] = [...MATCH3, ...CHOSEN6.filter((i) => !MATCH3.includes(i))];
  const base = 12 + f * 0.55; // degrees
  NODES.forEach((n, i) => {
    const appear = sp(f, 20 + i * 1.0, {damping: 20, stiffness: 150});
    const chosen6 = CHOSEN6.includes(i);
    const match = MATCH3.includes(i);
    let x = lerp(BRAND.x, n.x, appear);
    let y = lerp(BRAND.y, n.y, appear);
    let r = n.r * Math.min(1, appear);
    let o = Math.min(1, appear * 1.5);
    let select = 0;
    // 20 -> 6
    if (!chosen6) {
      const k = p6;
      x += (n.x - 960) * 0.1 * k;
      y += (n.y - 540) * 0.1 * k;
      r = lerp(r, 4.5, k);
      o *= lerp(1, 0.28, k);
      // after the filter they simply dissolve
      o *= 1 - prog(f, 54, 10, ease.soft);
    } else {
      select = p6;
    }
    // 6 -> 3
    if (chosen6 && !match) {
      r = lerp(r, 5, p3);
      o *= lerp(1, 0.25, p3);
    }
    if (match) {
      const mi = MATCH3.indexOf(i);
      x = lerp(x, MATCH_POS[mi].x, toLine);
      y = lerp(y, MATCH_POS[mi].y, toLine);
      r = lerp(r, 38, toLine);
    }
    // orbit around the title
    const oi = orbitIdx.indexOf(i);
    if (oi >= 0) {
      const th = ((oi * 60 + base) * Math.PI) / 180;
      const z = Math.sin(th);
      const ox = 960 + 850 * Math.cos(th);
      const oy = 540 + 380 * z;
      const sc = 0.82 + 0.22 * z;
      const rr = (match ? 36 : 14 + n.r * 0.1) * sc;
      const bf = ease.inOut(orbit);
      x = lerp(x, ox, bf);
      y = lerp(y, oy, bf);
      r = lerp(r, rr, bf);
      o *= lerp(1, (match ? 0.95 : 0.55) * (0.6 + 0.4 * (z + 1) * 0.5) * (match ? 1 : 1), bf);
      // collapse into the centre
      x = lerp(x, CENTER.x, collapse);
      y = lerp(y, CENTER.y, collapse);
      r *= 1 - collapse * 0.8;
      o *= 1 - collapse * 0.6;
    } else if (orbit > 0) {
      o *= 1 - orbit;
    }
    // hairline from brand
    const hairOp = 0.08 * appear * (chosen6 ? 1 : lerp(1, 0.2, p6)) * brandOut * (1 - prog(f, 48, 10, ease.soft));
    if (hairOp > 0.002) hair.push(<path key={`h${i}`} d={`M${BRAND.x} ${BRAND.y} L${x} ${y}`} stroke={C.ink} strokeWidth={1} opacity={hairOp / 0.08 * 0.09} />);
    if (o > 0.01 && r > 0.5) {
      const headAt = lineP * (pathLens[pathLens.length - 1]);
      let pulseP = 0;
      if (match) {
        // engagement ping when the line head passes the node
        const mi = MATCH3.indexOf(i) + 1;
        const when = 62 + 5 * mi;
        pulseP = f < when ? 0 : f < when + 30 ? prog(f, when, 30, ease.out) : ((f - when) % 48) / 48;
      }
      nodes.push(
        <CreatorNode
          key={i}
          x={x}
          y={y}
          r={r}
          opacity={o}
          select={select * (match ? 1 : chosen6 ? 1 - p3 * 0.8 : 0)}
          match={match ? prog(f, 52 + MATCH3.indexOf(i) * 3, 14, ease.out) : 0}
          pulse={pulseP}
          tone={hash(i, 4)}
        />,
      );
    }
  });

  // line ------------------------------------------------------
  const seg = slice(pathPts, pathLens, 0, lineP, 140);
  const lineFade = 1 - orbit * 0.0;
  const orbitRingOp = prog(f, 84, 16, ease.soft) * (1 - collapse);
  // turquoise arc that rides the orbit
  const orbitArc: Pt[] = [];
  {
    const th0 = ((base + 20) * Math.PI) / 180;
    for (let i = 0; i <= 60; i++) {
      const th = th0 - (i / 60) * 1.15;
      orbitArc.push({x: 960 + 850 * Math.cos(th), y: 540 + 380 * Math.sin(th)});
    }
  }
  const ringPts: Pt[] = [];
  for (let i = 0; i <= 120; i++) {
    const th = (i / 120) * Math.PI * 2;
    ringPts.push({x: 960 + 850 * Math.cos(th), y: 540 + 380 * Math.sin(th)});
  }

  // audience ---------------------------------------------------
  const audIn = prog(f, 32, 18, ease.out) * brandOut;
  const head = pointAt(pathPts, pathLens, lineP);
  const aud = AUDIENCE.map((d, i) => {
    const inn = prog(f, 32 + d.k * 12, 14, ease.out);
    const dist = Math.hypot(d.x - AUD.x, d.y - AUD.y);
    const lit = lineP > 0.9 ? prog(f, 74 + dist / 14 + d.k * 3, 10, ease.out) * (d.k < 0.42 ? 1 : 0) : 0;
    return (
      <circle key={i} cx={d.x} cy={d.y} r={3 + lit * 1.6} fill={lit > 0.02 ? C.teal : C.ink} opacity={(lit > 0.02 ? 0.4 + 0.6 * lit : 0.16) * inn * audIn} />
    );
  });

  // texts -------------------------------------------------------
  const counterOut = prog(f, 72, 12, ease.in);
  const ringR = lerp(10, BR, grow);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Lattice amount={0.7 * prog(f, 4, 20, ease.soft) * (1 - prog(f, 76, 20, ease.soft))} drift={-f * 1.2 + 200} id="latI" />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={1}>{hair}</g>
        {aud}
        <g opacity={orbitRingOp}>
          <FlowLine pts={ringPts} width={1.2} color={C.ink} opacity={0.12} />
          <FlowLine pts={orbitArc} width={2.4} opacity={0.95} />
        </g>
        <g opacity={lineFade * (1 - prog(f, 82, 12, ease.soft))}>
          <FlowLine pts={seg} width={2.6} />
        </g>
        {/* brand */}
        <g opacity={brandOut} transform={`translate(${bx} ${BRAND.y})`}>
          <circle r={10} fill={C.teal} opacity={1 - Math.min(1, grow * 4)} />
          <circle r={ringR} fill={C.bg} stroke={C.ink} strokeWidth={1.8} opacity={Math.min(1, grow * 1.5)} />
          <circle r={Math.max(6, ringR * 0.16)} fill={C.teal} />
          {f > 4 && f < 26 && <circle r={ringR + 20 * prog(f, 4, 22, ease.out)} fill="none" stroke={C.teal} strokeWidth={1.4} opacity={1 - prog(f, 4, 22, ease.out)} />}
        </g>
        {nodes}
        {/* the point that continues to the sales scene */}
        {collapse > 0.3 && <circle cx={CENTER.x} cy={CENTER.y} r={10 * ease.out(prog(f, 128, 10, ease.linear))} fill={C.teal} />}
      </svg>

      {/* brand / audience labels */}
      <Label x={bx} y={BRAND.y + BR + 40} text="BRAND" inAt={18} outAt={76} />
      <Label x={AUD.x} y={AUD.y + 170 + 40} text="AUDIENCE" inAt={34} outAt={76} />

      {/* counter */}
      <div style={{position: 'absolute', left: 0, width: W, top: 920, height: 100, display: 'flex', justifyContent: 'center', opacity: 1 - counterOut}}>
        <Swap stages={[26, 38, 50]} width={900} height={100} align="center" dur={14}>
          {[<Count key="a" n="20" l="CREATORS" />, <Count key="b" n="6" l="CREATORS" />, <Count key="c" n="3" l="PERFECT MATCHES" accent />]}
        </Swap>
      </div>

      <MaskLine text="INFLUENCER" y={395} size={178} inAt={86} outAt={124} outDur={12} inDur={24} />
      <MaskLine text="MARKETING" y={562} size={178} inAt={92} outAt={128} outDur={12} inDur={24} />
      <MaskLine text="Right Creator." y={722} size={36} weight={500} inAt={104} outAt={118} outDur={10} color={C.ink} trackFrom={0.04} trackTo={-0.01} lineHeight={1.3} />
      <MaskLine text="Right Audience." y={772} size={36} weight={500} inAt={110} outAt={122} outDur={10} color={C.mute} trackFrom={0.04} trackTo={-0.01} lineHeight={1.3} />
    </div>
  );
};

const Count: React.FC<{n: string; l: string; accent?: boolean}> = ({n, l, accent}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: FONT}}>
    <span style={{fontSize: 96, fontWeight: 300, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n}</span>
    <span style={{fontSize: 21, fontWeight: 500, letterSpacing: '0.26em', color: accent ? C.ink : C.mute}}>{l}</span>
  </div>
);

const Label: React.FC<{x: number; y: number; text: string; inAt: number; outAt: number}> = ({x, y, text, inAt, outAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, inAt, 18, ease.out) * (1 - prog(f, outAt, 12, ease.soft));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 150,
        width: 300,
        top: y - 12,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 500,
        letterSpacing: '0.28em',
        color: C.mute,
        opacity: p,
        transform: `translateY(${(1 - p) * 8}px)`,
        paddingLeft: '0.28em',
      }}
    >
      {text}
    </div>
  );
};

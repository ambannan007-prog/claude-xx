import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandNode} from '../components/BrandNode';
import {Stage} from '../components/Camera';
import {CreatorNode} from '../components/CreatorNode';
import {FlowLine} from '../components/FlowLine';
import {Caption, Headline, SwapSlot} from '../components/Typography';
import {E, mix, pop, prog, rand} from '../lib/anim';
import {catmull, sampler, type Pt} from '../lib/paths';
import {COLORS, FONT_DISPLAY, FONT_TEXT, LAYOUT} from '../theme';

/*
 * 7.8 – 12.4s  ·  Influencer Marketing
 * The conversion point is now the brand hub. Twenty creators orbit it; the
 * system filters to six, then three perfect matches, and the turquoise line
 * runs brand → creator → audience.
 */

export const ACT2_START = 234;
export const ACT2_END = 372;

const T = {
  nodesIn: 238,
  filter6: 266,
  filter3: 284,
  audienceIn: 290,
  lines: 298,
  shift: 294,
  headline: 296,
  caption: 310,
  headlineOut: 340,
  collapse: 346,
};

type Creator = {a: number; r: number; size: number; audience: number};

const CREATORS: Creator[] = Array.from({length: 20}, (_, i) => {
  const inner = i < 8;
  const n = inner ? 8 : 12;
  const k = inner ? i : i - 8;
  return {
    a: (k / n) * Math.PI * 2 + (inner ? Math.PI / 8 : 0.2),
    r: inner ? 212 : 352,
    size: inner ? 25 : 21,
    audience: 0.22 + rand(i + 40) * 0.55,
  };
});

const SHORTLIST = new Set([0, 3, 6, 10, 15, 19]);
/** creator index → its settled position as a perfect match. */
const MATCHES: Record<number, Pt> = {
  6: [214, -178],
  19: [262, 0],
  0: [214, 178],
};
const MATCH_IDS = [6, 19, 0];

const AUDIENCE_C: Pt = [560, 0];
const AUDIENCE = Array.from({length: 46}, (_, i) => {
  const r = 9.6 * Math.sqrt(i + 0.5);
  const a = i * 2.39996;
  return [AUDIENCE_C[0] + r * Math.cos(a), AUDIENCE_C[1] + r * Math.sin(a) * 1.05] as Pt;
});

const ROUTES = MATCH_IDS.map((id, k) => {
  const m = MATCHES[id];
  const end: Pt = [AUDIENCE_C[0] - 58, (k - 1) * 30];
  return sampler(catmull([[0, 0], [m[0] * 0.55, m[1] * 0.7], m, [mix(m[0], end[0], 0.55), mix(m[1], end[1], 0.7)], end]));
});

const ORBIT_SQUASH = 0.84;

export const Act2Influencer: React.FC = () => {
  const f = useCurrentFrame();

  const p6 = prog(f, T.filter6, 16, E.inOut);
  const p3 = prog(f, T.filter3, 18, E.inOut);
  const settle = prog(f, T.filter3 + 2, 22, E.out);
  const collapse = prog(f, T.collapse, 22, E.inOut);
  const shift = prog(f, T.shift, 34, E.camera) * (1 - collapse);

  const gx = mix(960, 1290, shift);
  const gy = mix(540, 556, shift);
  const gs = mix(1, 0.82, shift);
  const orbit = (f - ACT2_START) * 0.0021;

  const brandR = mix(64, 6, collapse);
  const brandOpen = 1 - prog(f, T.collapse + 6, 14, E.inOut);

  const audIn = prog(f, T.audienceIn, 18, E.out) * (1 - collapse);
  const lineHead = prog(f, T.lines, 26, E.soft);
  const lineTail = collapse;

  return (
    <AbsoluteFill>
      <Stage>
        <g transform={`translate(${gx} ${gy}) scale(${gs})`}>
          {/* Spokes: every creator is connected to the brand at first. */}
          {CREATORS.map((c, i) => {
            const pos = position(c, i, orbit, settle, collapse);
            const inP = prog(f, T.nodesIn + i * 1.1, 16, E.out);
            const dim = SHORTLIST.has(i) ? (i in MATCHES ? 1 : mix(1, 0.15, p3)) : mix(1, 0.12, p6);
            const hide = i in MATCHES ? 1 - p3 : 1;
            return (
              <line
                key={`s${i}`}
                x1={0}
                y1={0}
                x2={pos[0] * inP}
                y2={pos[1] * inP}
                stroke={COLORS.hair}
                strokeWidth={1.2}
                opacity={inP * dim * hide * (1 - collapse)}
              />
            );
          })}

          {/* Audience: a phyllotaxis field that lights up as reach arrives. */}
          <g opacity={audIn}>
            {AUDIENCE.map((p, i) => {
              const lit = prog(f, T.lines + 18 + (p[0] - AUDIENCE_C[0] + 80) / 14, 10, E.out);
              return (
                <circle
                  key={`a${i}`}
                  cx={mix(0, p[0], 1 - collapse)}
                  cy={mix(0, p[1], 1 - collapse)}
                  r={3.6 * pop(f, T.audienceIn + i * 0.25)}
                  fill={lit > 0.5 ? COLORS.accent : COLORS.faint}
                  opacity={mix(1, 0.85, lit)}
                />
              );
            })}
            <text
              x={AUDIENCE_C[0]}
              y={AUDIENCE_C[1] + 108}
              textAnchor="middle"
              fontFamily={FONT_TEXT}
              fontWeight={500}
              fontSize={15}
              letterSpacing="0.16em"
              fill={COLORS.mute}
            >
              AUDIENCE
            </text>
          </g>

          {/* Brand → creator → audience routes. */}
          {ROUTES.map((r, k) => (
            <g key={`r${k}`} transform={`scale(${1 - collapse})`}>
              <FlowLine d={r.d} from={lineTail} to={lineHead} width={2.4} tip={lineHead < 1 ? 3 : 0} />
              {lineHead >= 1 && collapse < 0.05
                ? [0, 0.5].map((o) => {
                    const t = ((f - T.lines - 26) / 30 + o + k * 0.17) % 1;
                    const s = r.at(t);
                    return <circle key={o} cx={s.x} cy={s.y} r={3} fill={COLORS.accent} opacity={Math.sin(t * Math.PI)} />;
                  })
                : null}
            </g>
          ))}

          {CREATORS.map((c, i) => {
            const pos = position(c, i, orbit, settle, collapse);
            const inP = pop(f, T.nodesIn + i * 1.1, 180, 16);
            const short = SHORTLIST.has(i);
            const isMatch = i in MATCHES;
            let opacity = 1;
            let scale = inP;
            if (!short) {
              opacity = mix(1, 0.14, p6);
              scale *= mix(1, 0.82, p6);
            } else if (!isMatch) {
              opacity = mix(1, 0.14, p3);
              scale *= mix(1, 0.82, p3);
            } else {
              scale *= 1 + 0.16 * pop(f, T.filter3 + 4, 160, 12) * p3;
            }
            scale *= 1 - collapse;
            return (
              <CreatorNode
                key={`c${i}`}
                id={`creator-${i}`}
                x={pos[0]}
                y={pos[1]}
                size={c.size}
                scale={scale}
                opacity={opacity}
                audience={c.audience}
                shortlist={short ? p6 : 0}
                match={isMatch ? p3 : 0}
              />
            );
          })}

          <BrandNode x={0} y={0} r={brandR} open={brandOpen} label={1 - prog(f, T.collapse, 8, E.inOut)} />

          {/* Selection readout. */}
          <foreignObject x={-400} y={-470} width={800} height={60} opacity={1 - prog(f, T.collapse - 6, 12, E.inOut)}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <SwapSlot
                height={44}
                style={{width: 800}}
                items={[
                  {start: T.nodesIn + 6, content: <Readout n="20" text="creators" />},
                  {start: T.filter6, content: <Readout n="6" text="shortlisted" />},
                  {start: T.filter3, content: <Readout n="3" text="perfect matches" accent />},
                ]}
              />
            </div>
          </foreignObject>
        </g>
      </Stage>

      <Headline lines={['Influencer', 'Marketing']} start={T.headline} exit={T.headlineOut} x={LAYOUT.marginX} y={LAYOUT.headlineTop} size={LAYOUT.headlineSize} />
      <Caption start={T.caption} exit={T.headlineOut} x={LAYOUT.marginX + 6} y={LAYOUT.captionTop}>
        Right Creator. Right Audience.
      </Caption>
    </AbsoluteFill>
  );
};

/** Creator position: slow orbit on a tilted plane, easing into match slots, then collapsing home. */
const position = (c: Creator, i: number, orbit: number, settle: number, collapse: number): Pt => {
  const a = c.a + orbit;
  let x = Math.cos(a) * c.r;
  let y = Math.sin(a) * c.r * ORBIT_SQUASH;
  const target = MATCHES[i];
  if (target) {
    x = mix(x, target[0], settle);
    y = mix(y, target[1], settle);
  }
  const k = 1 - collapse;
  return [x * k, y * k];
};

const Readout: React.FC<{n: string; text: string; accent?: boolean}> = ({n, text, accent}) => (
  <div style={{width: 800, textAlign: 'center', lineHeight: '44px', whiteSpace: 'nowrap'}}>
    <span style={{fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink, fontVariantNumeric: 'tabular-nums'}}>{n}</span>
    <span
      style={{
        marginLeft: 12,
        fontFamily: FONT_TEXT,
        fontWeight: 500,
        fontSize: 16,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: accent ? COLORS.accentDeep : COLORS.mute,
      }}
    >
      {text}
    </span>
  </div>
);


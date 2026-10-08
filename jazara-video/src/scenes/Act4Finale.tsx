import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Camera';
import {FlowLine} from '../components/FlowLine';
import {LogoReveal} from '../components/LogoReveal';
import {Headline} from '../components/Typography';
import {Wordmark} from '../components/Wordmark';
import {E, mix, pop, prog} from '../lib/anim';
import {catmull, J_POINTS, logoToWorld, ringPoints, sampler, type Pt} from '../lib/paths';
import {COLORS, FONT_DISPLAY} from '../theme';

/*
 * 16.5 – 20.0s  ·  Final brand statement
 * Performance, Influence and Sales stand side by side as miniature versions
 * of their systems. The words leave; their turquoise paths travel to the
 * centre, merge, and paint the Jazara logo.
 */

export const ACT4_START = 494;

const LOGO_C: Pt = [960, 372];
const LOGO_SIZE = 300;
const RING_W = ringPoints().map((p) => logoToWorld(p, LOGO_C, LOGO_SIZE));
const J_W = J_POINTS.map((p) => logoToWorld(p, LOGO_C, LOGO_SIZE));
const RING_PEN = sampler(catmull(RING_W));
const J_PEN = sampler(catmull(J_W));
const MEET = RING_W[0];

const GLYPH_Y = 596;
const T = {
  words: 502,
  glyphs: 505,
  wordsOut: 521,
  travel: 528,
  travelDur: 16,
  ring: 543,
  j: 550,
  full: 562,
  wordmark: 558,
  statement: 563,
};

type System = {word: string; cx: number; glyph: Pt[]; travel: Pt[]; marks: (t: number) => number[]};

const SYSTEMS: System[] = [
  {
    word: 'Performance',
    cx: 420,
    glyph: [[-130, 34], [-70, 28], [-10, 12], [50, -4], [130, -34]],
    travel: [[640, 598], [800, 580], [905, 538]],
    marks: () => [0.36, 0.68, 1],
  },
  {
    word: 'Influence',
    cx: 960,
    glyph: [[-130, 16], [-50, -26], [40, -26], [130, 16]],
    travel: [[1150, 650], [1060, 706], [930, 690], [870, 610], [905, 532]],
    marks: () => [0, 0.5, 1],
  },
  {
    word: 'Sales',
    cx: 1500,
    // Read right-to-left so the path can turn back toward the centre.
    glyph: [[130, 0], [43, 0], [-43, 0], [-130, 0]],
    travel: [[1260, 610], [1110, 640], [990, 612], [912, 540]],
    marks: () => [0, 1 / 3, 2 / 3, 1],
  },
];

const PATHS = SYSTEMS.map((s) => {
  const glyph = s.glyph.map(([x, y]) => [s.cx + x, GLYPH_Y + y] as Pt);
  const full = sampler(catmull([...glyph, ...s.travel, MEET]));
  const glyphOnly = sampler(catmull(glyph));
  return {full, glyphT: glyphOnly.length / full.length, glyphOnly};
});

export const Act4Finale: React.FC = () => {
  const f = useCurrentFrame();

  const ringHead = prog(f, T.ring, 15, E.soft);
  const jHead = prog(f, T.j, 15, E.soft);
  const full = prog(f, T.full, 8, E.inOut);
  const penFade = 1 - prog(f, T.full, 8, E.inOut);
  const push = 1 + 0.035 * prog(f, T.ring, 600 - T.ring, E.linear);

  return (
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      <Stage>
        {PATHS.map((p, i) => {
          const draw = prog(f, T.glyphs + i * 3, 18, E.soft);
          const head = mix(p.glyphT * draw, 1, prog(f, T.travel, T.travelDur, E.inOut));
          const tail = prog(f, T.travel + 1, T.travelDur + 3, E.inOut);
          const marksOn = prog(f, T.glyphs + 8 + i * 3, 12, E.out) * (1 - prog(f, T.wordsOut, 8, E.inOut));
          return (
            <g key={i}>
              <FlowLine d={p.full.d} from={tail} to={head} width={2.6} tip={f > T.travel && head < 1 ? 3 : 0} />
              {marksOn > 0
                ? SYSTEMS[i].marks(0).map((t, k) => {
                    const s = p.glyphOnly.at(t);
                    const last = i === 2 ? k === 3 : k === SYSTEMS[i].marks(0).length - 1;
                    const r = (i === 1 && k === 1 ? 9 : 5) * pop(f, T.glyphs + 10 + i * 3 + k * 2, 220, 14);
                    return (
                      <g key={k} opacity={marksOn}>
                        {i === 1 && k === 1 ? (
                          <circle cx={s.x} cy={s.y} r={r} fill={COLORS.paper} stroke={COLORS.accent} strokeWidth={2.5} />
                        ) : (
                          <circle cx={s.x} cy={s.y} r={r} fill={last ? COLORS.accent : COLORS.paper} stroke={COLORS.accent} strokeWidth={2} />
                        )}
                      </g>
                    );
                  })
                : null}
            </g>
          );
        })}

        <FlowLine d={RING_PEN.d} from={ringHead - 0.3} to={ringHead} width={1.8} tip={ringHead < 1 ? 2.6 : 0} opacity={penFade} />
        <FlowLine d={J_PEN.d} from={jHead - 0.3} to={jHead} width={1.8} tip={jHead < 1 ? 2.6 : 0} opacity={penFade} />
        {f >= T.ring ? <LogoReveal id="final-logo" center={LOGO_C} size={LOGO_SIZE} ring={ringHead} j={jHead} full={full} /> : null}
      </Stage>

      {SYSTEMS.map((s, i) => (
        <Headline
          key={s.word}
          lines={[s.word]}
          start={T.words + i * 3}
          exit={T.wordsOut + i * 2}
          x={s.cx}
          y={430}
          size={84}
          align="center"
          tracking={-0.03}
        />
      ))}

      <Wordmark x={960} y={LOGO_C[1] + 196} start={T.wordmark} />
      <Statement start={T.statement} />
    </AbsoluteFill>
  );
};

const WORDS = ['Attention', 'Influence', 'Conversion'];

const Statement: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: 1920,
        top: 742,
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: 46,
        letterSpacing: '0.06em',
        color: COLORS.ink,
      }}
    >
      {WORDS.map((w, i) => {
        const p = prog(f, start + i * 3, 20, E.out);
        return (
          <div key={w} style={{overflow: 'hidden', height: 58, lineHeight: '58px'}}>
            <div
              style={{
                transform: `translateY(${(1 - p) * 105}%)`,
                opacity: Math.min(1, p * 1.5),
                filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
              }}
            >
              {w.toUpperCase()}
              <span style={{color: COLORS.accent}}>.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

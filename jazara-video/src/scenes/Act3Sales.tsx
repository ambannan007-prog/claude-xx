import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Stage} from '../components/Camera';
import {Caption, Headline, Label} from '../components/Typography';
import {E, mix, pop, prog} from '../lib/anim';
import {COLORS, FONT_DISPLAY, FONT_TEXT, LAYOUT} from '../theme';

/*
 * 12.4 – 16.9s  ·  Sales Training
 * The collapsed creator network is a single point that opens into a
 * conversation. Each objection is answered, then the four messages re-form
 * as the stages of a sales journey the turquoise line locks through.
 */

export const ACT3_START = 372;
export const ACT3_END = 510;

const SPINE_X = 960;
const LEAD_RIGHT = 922;
const REPLY_LEFT = 998;

const MESSAGES = [
  {text: 'Price?', y: 350, at: 380, stage: 'Enquiry'},
  {text: 'Need details.', y: 440, at: 390, stage: 'Conversation'},
  {text: 'Will decide later.', y: 530, at: 400, stage: 'Follow-up'},
  {text: 'Interested.', y: 620, at: 412, stage: 'Close'},
];

const FUNNEL_X = 1250;
const FUNNEL_Y = [330, 450, 570, 690];
const LOCK = [440, 448, 456, 464];

const T = {
  spine: 372,
  labels: 378,
  transform: 420,
  track: 434,
  ring: 464,
  check: 475,
  headline: 436,
  caption: 450,
  exit: 482,
};

export const Act3Sales: React.FC = () => {
  const f = useCurrentFrame();

  const spineIn = prog(f, T.spine, 18, E.out);
  const chatOut = prog(f, T.transform, 16, E.inOut);
  const funnelOut = prog(f, T.exit, 14, E.inOut);

  const lineY = interpolate(f, LOCK, FUNNEL_Y, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: E.inOut,
  });
  const lineOn = f >= LOCK[0];
  const ringP = prog(f, T.ring, 14, E.inOut);
  const checkP = prog(f, T.check, 10, E.out);

  return (
    <AbsoluteFill>
      <Stage>
        {/* Conversation spine grows out of the collapsed network point. */}
        <g opacity={1 - chatOut}>
          <line
            x1={SPINE_X}
            x2={SPINE_X}
            y1={mix(540, 290, spineIn)}
            y2={mix(540, 680, spineIn)}
            stroke={COLORS.hair}
            strokeWidth={1.5}
          />
          <circle cx={SPINE_X} cy={mix(540, 290, spineIn)} r={6 * (1 - prog(f, T.spine + 8, 12, E.inOut))} fill={COLORS.accent} />
        </g>

        {/* Sales responses meeting each objection. */}
        {MESSAGES.slice(0, 3).map((m, i) => {
          const reply = m.at + 6;
          const p = prog(f, reply + 2, 7, E.inOut);
          const out = chatOut;
          if (f < reply) return null;
          const d = `M ${REPLY_LEFT} ${m.y} C ${REPLY_LEFT - 22} ${m.y - 34}, ${LEAD_RIGHT + 22} ${m.y - 34}, ${LEAD_RIGHT} ${m.y}`;
          const badge = pop(f, m.at + 10, 220, 14);
          return (
            <g key={i} opacity={1 - out}>
              <path d={d} fill="none" stroke={COLORS.accent} strokeWidth={2} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} />
              <g transform={`translate(${LEAD_RIGHT - 4} ${m.y - 30}) scale(${badge})`}>
                <circle r={12} fill={COLORS.accent} />
                <path d="M -5 0.5 L -1.5 4 L 5.5 -3.5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          );
        })}

        {/* Funnel track and travelling conversion line. */}
        <g opacity={1 - funnelOut}>
          <line
            x1={FUNNEL_X}
            x2={FUNNEL_X}
            y1={FUNNEL_Y[0]}
            y2={mix(FUNNEL_Y[0], FUNNEL_Y[3], prog(f, T.track, 14, E.inOut))}
            stroke={COLORS.hair}
            strokeWidth={2}
            opacity={prog(f, T.track, 4, E.linear)}
          />
          {lineOn ? <line x1={FUNNEL_X} x2={FUNNEL_X} y1={FUNNEL_Y[0]} y2={lineY} stroke={COLORS.accent} strokeWidth={3} strokeLinecap="round" /> : null}
          {FUNNEL_Y.map((y, i) => {
            const appear = prog(f, T.transform + 10 + i * 3, 14, E.out);
            const lock = f >= LOCK[i] ? pop(f, LOCK[i], 260, 13) : 0;
            const r = 10;
            return (
              <g key={i} transform={`translate(${FUNNEL_X} ${y})`} opacity={appear}>
                <circle r={r} fill={COLORS.paper} stroke={COLORS.faint} strokeWidth={2} />
                {lock > 0 ? <circle r={r * lock} fill={COLORS.accent} /> : null}
              </g>
            );
          })}
          {/* Final conversion indicator. */}
          {ringP > 0 ? (
            <g transform={`translate(${FUNNEL_X} ${FUNNEL_Y[3]})`}>
              <circle r={26} fill="none" stroke={COLORS.hair} strokeWidth={2} />
              <circle
                r={26}
                fill="none"
                stroke={COLORS.accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${ringP} 2`}
                transform="rotate(-90)"
              />
              <circle r={10 + 6 * pop(f, T.check - 2, 220, 12)} fill={COLORS.accent} />
              <path
                d="M -6 0.5 L -2 4.5 L 6.5 -4"
                fill="none"
                stroke="#fff"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={`${checkP} 2`}
              />
            </g>
          ) : null}
        </g>
      </Stage>

      <Label start={T.labels} exit={T.transform} x={LEAD_RIGHT} y={258} align="right">
        Lead
      </Label>
      <Label start={T.labels + 2} exit={T.transform} x={REPLY_LEFT} y={258}>
        Sales team
      </Label>

      {/* Sales replies: abstract, confident, never verbose. */}
      {MESSAGES.slice(0, 3).map((m, i) => {
        const p = pop(f, m.at + 6, 200, 16);
        if (f < m.at + 6) return null;
        return (
          <div
            key={`r${i}`}
            style={{
              position: 'absolute',
              left: REPLY_LEFT,
              top: m.y - 26,
              height: 52,
              width: 152,
              borderRadius: 26,
              background: COLORS.ink,
              transformOrigin: '0 50%',
              transform: `translateX(${(1 - p) * 18}px) scale(${mix(0.92, 1, p)})`,
              opacity: Math.min(1, p) * (1 - chatOut),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 7,
              padding: '0 24px',
              boxShadow: '0 12px 30px rgba(17,17,17,0.10)',
            }}
          >
            <div style={{height: 5, width: 96, borderRadius: 3, background: 'rgba(255,255,255,0.55)'}} />
            <div style={{height: 5, width: 58, borderRadius: 3, background: 'rgba(255,255,255,0.3)'}} />
          </div>
        );
      })}

      {/* Lead messages that re-form into the stages of the sales journey. */}
      {MESSAGES.map((m, i) => {
        if (f < m.at) return null;
        const p = pop(f, m.at, 200, 16);
        const handled = i < 3 ? prog(f, m.at + 10, 10, E.inOut) : 0;
        const mv = prog(f, T.transform + i * 3, 26, E.inOut);
        const locked = f >= LOCK[i] ? prog(f, LOCK[i], 8, E.out) : 0;
        const left = mix(LEAD_RIGHT, FUNNEL_X + 40, mv);
        const top = mix(m.y, FUNNEL_Y[i], mv);
        const final = i === 3;
        const exit = prog(f, T.exit + i * 2, 14, E.in);
        return (
          <div
            key={`m${i}`}
            style={{
              position: 'absolute',
              left,
              top,
              transform: `translate(${-(1 - mv) * 100}%, -50%) translateX(${(1 - Math.min(1, p)) * -18}px) translateY(${-exit * 24}px)`,
              opacity: Math.min(1, p) * (1 - exit),
              display: 'grid',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                gridArea: '1 / 1',
                justifySelf: 'end',
                height: 60,
                borderRadius: 30,
                padding: final ? '0 28px 0 24px' : '0 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: final ? COLORS.ink : COLORS.card,
                border: final ? 'none' : `1px solid ${COLORS.hair}`,
                boxShadow: '0 12px 30px rgba(17,17,17,0.06)',
                fontFamily: FONT_TEXT,
                fontWeight: 500,
                fontSize: 26,
                color: final ? '#fff' : handled > 0.5 ? COLORS.mute : COLORS.ink,
                opacity: 1 - prog(f, T.transform + i * 3, 12, E.inOut),
              }}
            >
              {final ? <span style={{width: 10, height: 10, borderRadius: 5, background: COLORS.accent}} /> : null}
              {m.text}
            </div>
            <div
              style={{
                gridArea: '1 / 1',
                justifySelf: 'start',
                alignSelf: 'center',
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: locked > 0.5 ? COLORS.ink : COLORS.mute,
                opacity: prog(f, T.transform + i * 3 + 12, 14, E.out),
              }}
            >
              {m.stage}
            </div>
          </div>
        );
      })}

      <Headline lines={['Sales', 'Training']} start={T.headline} exit={T.exit} x={LAYOUT.marginX} y={LAYOUT.headlineTop} size={LAYOUT.headlineSize} />
      <Caption start={T.caption} exit={T.exit} x={LAYOUT.marginX + 6} y={LAYOUT.captionTop}>
        {'Turn conversations\ninto conversions.'}
      </Caption>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {BrandNode} from '../components/BrandNode';
import {Camera, project, Stage} from '../components/Camera';
import {FlowLine} from '../components/FlowLine';
import {LogoReveal} from '../components/LogoReveal';
import {Arrow, Caption, CountUp, Headline, Label, SwapSlot} from '../components/Typography';
import {Wordmark} from '../components/Wordmark';
import {clamp01, E, mix, pop, prog, rand} from '../lib/anim';
import {catmull, J_POINTS, logoToWorld, ringPoints, sampler, type Pt} from '../lib/paths';
import {COLORS, FONT_DISPLAY, FONT_TEXT, LAYOUT} from '../theme';

/*
 * 0.0 – 7.8s  ·  Brand intro → Performance Marketing
 * One world plane. A thin turquoise stroke enters, paints the real logo, then
 * leaves the J's crossbar and becomes the campaign data stream as the camera
 * pans past the mark.
 */

export const ACT1_END = 234;

const LOGO_C: Pt = [960, 440];
const LOGO_SIZE = 400;
const PAN_X = 1400;

// Pen 1: lead-in from off-frame, then the ring.
const RING_W = ringPoints().map((p) => logoToWorld(p, LOGO_C, LOGO_SIZE));
const LEAD_IN: Pt[] = [[-200, 880], [200, 830], [560, 720], [830, 632]];
const PEN1 = sampler(catmull([...LEAD_IN, ...RING_W]));
const LEAD_LEN = sampler(catmull([...LEAD_IN, RING_W[0]])).length;
const RING_LEN = PEN1.length - LEAD_LEN;

// Pen 2: the J, continuing out of the crossbar into the data stream.
const J_W = J_POINTS.map((p) => logoToWorld(p, LOGO_C, LOGO_SIZE));
const J_END = J_W[J_W.length - 1];
const DATA_PTS: Pt[] = [
  [J_END[0] + 95, J_END[1] - 32],
  [1290, 440],
  [1380, 650],
  [1470, 880],
  [1610, 958],
  [1850, 936],
  [2150, 868],
  [2450, 792],
  [2720, 702],
  [2920, 622],
  [3100, 560],
];
const PEN2 = sampler(catmull([...J_W, ...DATA_PTS]));
const J_LEN = sampler(catmull(J_W)).length;
const J_T = J_LEN / PEN2.length;
const CONV: Pt = [3100, 560];

// Funnel gates along the stream (normalised positions on PEN2).
const T_ENTER = PEN2.tAtX(1395);
const GATE1 = PEN2.tAtX(2150);
const GATE2 = PEN2.tAtX(2720);

const SIGNALS = [
  {t: GATE1, label: 'CTR', value: '3.8%', dy: -78},
  {t: GATE2, label: 'Cost / lead', value: '₹142', dy: -78},
  {t: 0.9995, label: 'ROAS', value: '4.6×', dy: -86},
];

const PARTICLES = Array.from({length: 190}, (_, i) => ({
  birth: 90 + i * 0.68 + rand(i + 3) * 2,
  dur: 62 * (0.82 + rand(i + 11) * 0.36),
  side: (rand(i + 7) - 0.5) * 2,
  r: rand(i + 19),
}));

const easeJ = Easing.in(Easing.sin);
const easeData = Easing.out(Easing.quad);

/** Distance travelled by pen 2 (J, then data stream). */
const pen2Dist = (f: number) =>
  f < 66
    ? J_LEN * easeJ(clamp01((f - 40) / 26))
    : J_LEN + (PEN2.length - J_LEN) * easeData(clamp01((f - 66) / 86));

const camera = (f: number): {focus: Pt; scale: number} => {
  const intro = prog(f, 0, 66, E.soft);
  let fx = mix(470, 960, intro);
  let fy = mix(770, 540, intro);
  let sc = mix(1.85, 1, intro);
  fx += PAN_X * prog(f, 78, 42, E.camera);
  fx += Math.max(0, f - 120) * 0.45; // slow drift keeps the data plane alive
  const push = prog(f, 202, 32, E.camera);
  fx = mix(fx, CONV[0], push);
  fy = mix(fy, CONV[1], push);
  sc = mix(sc, 1.6, push);
  return {focus: [fx, fy], scale: sc};
};

const spread = (t: number) => {
  if (t < GATE1) return mix(44, 30, (t - T_ENTER) / (GATE1 - T_ENTER));
  if (t < GATE2) return mix(13, 9, (t - GATE1) / (GATE2 - GATE1));
  return mix(3, 0, (t - GATE2) / (1 - GATE2));
};

const DataStream: React.FC<{f: number; headT: number}> = ({f, headT}) => {
  return (
    <g>
      {PARTICLES.map((p, i) => {
        const age = f - p.birth;
        if (age < 0) return null;
        const pass1 = p.r < 0.3;
        const pass2 = p.r < 0.1;
        let t = T_ENTER + (age / p.dur) * (1 - T_ENTER);
        let fall = 0;
        let stopAt = 2;
        if (!pass1) stopAt = GATE1;
        else if (!pass2) stopAt = GATE2;
        if (t > stopAt) {
          const crossAge = ((stopAt - T_ENTER) / (1 - T_ENTER)) * p.dur;
          fall = clamp01((age - crossAge) / 16);
          t = stopAt;
        }
        if (t > headT || t >= 1 || fall >= 1) return null;
        const s = PEN2.at(t);
        const off = p.side * spread(t);
        const nx = -Math.sin(s.angle);
        const ny = Math.cos(s.angle);
        const x = s.x + nx * off + fall * 26;
        const y = s.y + ny * off + Easing.in(Easing.quad)(fall) * 70;
        const stage = t < GATE1 ? 0 : t < GATE2 ? 1 : 2;
        const color = stage === 0 ? '#C2C2BD' : stage === 1 ? COLORS.ink : COLORS.accent;
        const r = stage === 2 ? 4.2 : stage === 1 ? 3.4 : 3;
        const appear = clamp01(age / 6);
        const arrive = 1 - clamp01((t - 0.985) / 0.015);
        return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={appear * arrive * (1 - fall)} />;
      })}
    </g>
  );
};

const Gate: React.FC<{t: number; f: number; headT: number}> = ({t, f, headT}) => {
  const s = PEN2.at(t);
  const vis = clamp01((headT - t) * 40);
  if (vis <= 0) return null;
  const nx = -Math.sin(s.angle);
  const ny = Math.cos(s.angle);
  const len = 30 * E.out(vis);
  return (
    <line
      x1={s.x - nx * len}
      y1={s.y - ny * len}
      x2={s.x + nx * len}
      y2={s.y + ny * len}
      stroke={COLORS.faint}
      strokeWidth={1.2}
    />
  );
};

const Signal: React.FC<{t: number; label: string; value: string; dy: number; headT: number; passFrame: number; f: number}> = ({
  t,
  label,
  value,
  dy,
  passFrame,
  f,
}) => {
  if (f < passFrame) return null;
  const p = prog(f, passFrame, 22, E.out);
  const s = PEN2.at(t);
  const stem = dy * p;
  return (
    <g>
      <circle cx={s.x} cy={s.y} r={5 * pop(f, passFrame)} fill={COLORS.accent} />
      <line x1={s.x} y1={s.y - 10} x2={s.x} y2={s.y + stem + 10} stroke={COLORS.faint} strokeWidth={1.2} opacity={p} />
      <g opacity={p} transform={`translate(${s.x + 14} ${s.y + dy + 8 + (1 - p) * 10})`}>
        <text fontFamily={FONT_TEXT} fontWeight={500} fontSize={14} letterSpacing="0.14em" fill={COLORS.mute} style={{textTransform: 'uppercase'}}>
          {label}
        </text>
        <text y={30} fontFamily={FONT_DISPLAY} fontWeight={600} fontSize={26} fill={COLORS.ink} style={{fontVariantNumeric: 'tabular-nums'}}>
          {value}
        </text>
      </g>
    </g>
  );
};

/** Frame at which pen 2 reaches normalised position t. */
const passFrameFor = (t: number) => {
  for (let f = 40; f < 200; f += 0.5) if (pen2Dist(f) / PEN2.length >= t) return f;
  return 200;
};
const SIGNAL_FRAMES = SIGNALS.map((s) => passFrameFor(s.t));

export const Act1IntroPerformance: React.FC = () => {
  const f = useCurrentFrame();
  const {focus, scale} = camera(f);

  // Pen 1 — lead-in and ring.
  const s1 = (LEAD_LEN + RING_LEN) * prog(f, 6, 46, E.soft);
  const ringHead = clamp01((s1 - LEAD_LEN) / RING_LEN);
  const pen1Head = s1 / PEN1.length;
  const pen1Fade = 1 - prog(f, 50, 10, E.inOut);

  // Pen 2 — J then the data stream.
  const s2 = pen2Dist(f);
  const head2 = s2 / PEN2.length;
  const jHead = clamp01(s2 / J_LEN);
  const logoFull = prog(f, 62, 12, E.inOut);

  // World fades as the camera pushes into the conversion point.
  const worldFade = 1 - prog(f, 206, 20, E.inOut);
  const logoOpacity = 1 - prog(f, 96, 18, E.inOut);
  const wordmarkShift = -260 * prog(f, 78, 42, E.camera);

  // Conversion point → brand hub (screen space, so it can hand off exactly).
  const convVisible = f >= SIGNAL_FRAMES[2];
  const [cx, cy] = project(CONV, focus, scale);
  const grow = prog(f, 208, 26, E.inOut);
  const convR = mix(7 * scale * pop(f, SIGNAL_FRAMES[2]), 64, grow);

  return (
    <AbsoluteFill>
      <Camera focus={focus} scale={scale}>
        <Stage>
          <g opacity={worldFade}>
            <LogoReveal id="act1-logo" center={LOGO_C} size={LOGO_SIZE} ring={ringHead} j={jHead} full={logoFull} opacity={logoOpacity} />
            {/* Persistent data stream: everything pen 2 has drawn after the J. */}
            <FlowLine d={PEN2.d} from={J_T} to={head2} width={2.6} />
            {/* The travelling pens. */}
            <FlowLine d={PEN1.d} from={pen1Head - 0.32} to={pen1Head} width={1.6} tip={2.6} opacity={pen1Fade} />
            <FlowLine
              d={PEN2.d}
              from={head2 - 0.12}
              to={Math.min(head2, 0.9995)}
              width={1.8}
              tip={f > 40 && head2 < 0.999 ? 2.8 : 0}
            />
            <Gate t={GATE1} f={f} headT={head2} />
            <Gate t={GATE2} f={f} headT={head2} />
            <DataStream f={f} headT={head2} />
            {SIGNALS.map((s, i) => (
              <Signal key={i} {...s} headT={head2} passFrame={SIGNAL_FRAMES[i]} f={f} />
            ))}
          </g>
        </Stage>
        <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${wordmarkShift}px)`, opacity: logoOpacity}}>
          <Wordmark x={LOGO_C[0]} y={LOGO_C[1] + 236} start={56} />
        </div>
      </Camera>

      {/* Screen-space HUD for scene 2. */}
      <Label start={110} exit={150} x={LAYOUT.marginX + 4} y={LAYOUT.headlineTop - 34}>
        Campaign signal
      </Label>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: LAYOUT.headlineTop}}>
        <SwapSlot
          height={190}
          exit={154}
          items={[
            {start: 110, content: <Metric value={<CountUp from={0} to={12481} start={110} dur={24} />} unit="clicks" />},
            {start: 132, content: <Metric value="428" unit="leads" />},
            {start: 144, content: <Metric value="63" unit="sales" accent />},
          ]}
        />
      </div>
      <Headline lines={['Performance', 'Marketing']} start={156} exit={208} x={LAYOUT.marginX} y={LAYOUT.headlineTop} size={LAYOUT.headlineSize} />
      <Caption start={170} exit={204} x={LAYOUT.marginX + 6} y={LAYOUT.captionTop}>
        Attention
        <Arrow />
        Leads
        <Arrow />
        Revenue
      </Caption>

      {convVisible ? (
        <Stage>
          <BrandNode x={cx} y={cy} r={convR} open={grow} label={prog(f, 222, 12, E.out)} />
        </Stage>
      ) : null}
    </AbsoluteFill>
  );
};

const Metric: React.FC<{value: React.ReactNode; unit: string; accent?: boolean}> = ({value, unit, accent}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
    <span
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        fontSize: 168,
        lineHeight: '190px',
        letterSpacing: '-0.04em',
        color: COLORS.ink,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
    <span style={{fontFamily: FONT_TEXT, fontWeight: 500, fontSize: 34, color: accent ? COLORS.accentDeep : COLORS.grey}}>{unit}</span>
  </div>
);

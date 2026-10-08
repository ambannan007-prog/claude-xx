import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W, H} from '../theme';
import {FlowLine} from '../components/FlowLine';
import {MaskLine, Caption} from '../components/Type';
import {FlowCaption} from '../components/FlowCaption';
import {Swap} from '../components/Swap';
import {Lattice} from '../components/Background';
import {ease, prog, lerp, hash, map} from '../lib/ease';
import {Pt, bez3, pt, sample, cumLengths, slice, mixPt} from '../lib/geom';

export const PERF_LEN = 138;
/** where the conversion point ends up: the centre of the next scene */
export const CONVERSION_END = pt(960, 540);
export const PERF_DOT_START = pt(1500, 900);

const G1 = 1180;
const G2 = 1560;
const NP = 230;

const lineY = (x: number, f: number, base: number, amp: number) =>
  base + amp * (0.7 * Math.sin(x / 300 + f * 0.045) + 0.3 * Math.sin(x / 125 - f * 0.07));

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const Numeral: React.FC<{v: string}> = ({v}) => (
  <div style={{fontFamily: FONT, fontSize: 168, fontWeight: 300, letterSpacing: '-0.045em', color: C.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
    {v}
  </div>
);

const Label: React.FC<{t: string}> = ({t}) => (
  <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 500, letterSpacing: '0.28em', color: C.mute, paddingLeft: '0.28em'}}>{t}</div>
);

export const Performance: React.FC = () => {
  const f = useCurrentFrame();

  // --- the line: arrives as a fat band (continuing the camera move), becomes a precise data stream
  const arrive = ease.out(prog(f, 0, 26, ease.linear));
  const dock = prog(f, 54, 24, ease.inOut);
  const base = lerp(540, 905, dock);
  const amp = lerp(0, 62, ease.out(prog(f, 0, 40, ease.linear))) * lerp(1, 0.42, dock);
  const strokeW = 3 + 80 * Math.pow(1 - arrive, 1.6);
  const lineOp = prog(f, 0, 5, ease.linear) * (1 - prog(f, 108, 14, ease.soft));
  const line: Pt[] = [];
  for (let i = 0; i <= 150; i++) {
    const x = -40 + (i / 150) * (W + 80);
    line.push({x, y: lineY(x, f, base, amp)});
  }

  // --- data particles
  const dots: React.ReactNode[] = [];
  const density = prog(f, 4, 24, ease.soft) * (1 - prog(f, 60, 14, ease.soft));
  for (let i = 0; i < NP; i++) {
    const x0 = hash(i, 3) * (W + 300);
    const v = 120 + 190 * hash(i, 4);
    const x = ((x0 + v * (f / 30) + 150) % (W + 300)) - 150;
    const s1 = hash(i, 1) < 0.1;
    const s2 = s1 && hash(i, 2) < 0.45;
    const ly = lineY(x, f, base, amp);
    const off = (hash(i, 5) - 0.5) * 34;
    const dir = hash(i, 6) < 0.5 ? -1 : 1;
    let y = ly, r = 3.2, op = 0.62, kind = 0;
    // zone 0: clicks around the line
    const gate1 = map(x, G1 - 50, G1 + 20, 0, 1, ease.inOut);
    const gate2 = map(x, G2 - 50, G2 + 20, 0, 1, ease.inOut);
    y = ly + off * (1 - gate1);
    if (x > G1 - 50) {
      if (!s1) {
        // filtered out: deflects and fades
        const d = map(x, G1 - 50, G1 + 90, 0, 1);
        y = ly + off + dir * d * d * 90;
        op = 0.62 * (1 - d);
      } else {
        r = lerp(3.2, 5.6, gate1);
        kind = 1;
        if (x > G2 - 50) {
          if (!s2) {
            const d = map(x, G2 - 50, G2 + 90, 0, 1);
            y = ly + dir * d * d * 80;
            op = 1 - d;
          } else {
            kind = 2;
            r = lerp(5.6, 7, gate2);
          }
        }
        op = Math.max(op, 0.0) * 1;
        if (kind === 1 && x <= G2 - 50) op = 0.9;
      }
    }
    if (op <= 0.01) continue;
    const o = op * density;
    if (kind === 0) dots.push(<circle key={i} cx={x} cy={y} r={r} fill={C.ink} opacity={o * 0.8} />);
    else if (kind === 1) dots.push(<circle key={i} cx={x} cy={y} r={r} fill={C.bg} stroke={C.ink} strokeWidth={1.6} opacity={o} />);
    else dots.push(<circle key={i} cx={x} cy={y} r={r} fill={C.teal} opacity={o} />);
  }

  // --- ribbon: hairline threads that converge into the single turquoise line at the first gate
  const threads: React.ReactNode[] = [];
  for (let k = 0; k < 7; k++) {
    const o = (k - 3) * 15;
    const pts2: Pt[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = -40 + (i / 120) * (G1 + 40);
      const conv = ease.inOut(map(x, G1 - 420, G1, 0, 1));
      const wob = Math.sin(x / 90 + f * 0.05 + k * 1.3) * 5 * (1 - conv);
      pts2.push({x, y: lineY(x, f, base, amp) + (o + wob) * (1 - conv)});
    }
    threads.push(<FlowLine key={k} pts={pts2} width={1.1} color={C.ink} opacity={0.13 * density * (1 - prog(f, 56, 12, ease.soft))} />);
  }

  // --- gates (brackets) + labels
  const gateIn = (at: number) => prog(f, at, 18, ease.out);
  const gateOut = 1 - prog(f, 56, 12, ease.soft);
  const gate = (gx: number, at: number, key: string) => {
    const p = gateIn(at) * gateOut;
    const gy = lineY(gx, f, base, amp);
    const h = 62 * p;
    return (
      <g key={key} opacity={p}>
        <path d={`M${gx} ${gy - 26 - h} V${gy - 26}`} stroke={C.ink} strokeWidth={1.4} opacity={0.3} strokeLinecap="round" />
        <path d={`M${gx} ${gy + 26} V${gy + 26 + h}`} stroke={C.ink} strokeWidth={1.4} opacity={0.3} strokeLinecap="round" />
      </g>
    );
  };

  // --- counter
  const c1 = ease.out(prog(f, 10, 20, ease.linear));
  const c2 = ease.inOut(prog(f, 30, 12, ease.linear));
  const c3 = ease.inOut(prog(f, 46, 12, ease.linear));
  let val = 12481 * c1;
  if (f >= 30) val = lerp(12481, 428, c2);
  if (f >= 46) val = lerp(428, 63, c3);
  const counterOut = prog(f, 54, 12, ease.in);

  // --- growth curve + readouts
  const gp = prog(f, 14, 34, ease.inOut);
  const growth: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    growth.push({x: 1390 + t * 400, y: 862 - 150 * Math.pow(t, 2.1) - 8 * Math.sin(t * 22) * t});
  }
  const gl = cumLengths(growth);
  const growthSeg = slice(growth, gl, 0, gp, 60);
  const readOut = 1 - prog(f, 56, 12, ease.soft);
  const roas = lerp(0, 4.2, ease.out(prog(f, 18, 30, ease.linear)));

  // --- signals (campaign pulses)
  const bars: React.ReactNode[] = [];
  const hot = Math.floor(f / 3) % 22;
  for (let i = 0; i < 22; i++) {
    const hgt = 6 + 58 * Math.pow(Math.abs(Math.sin(f * 0.07 + i * 0.55 + hash(i, 9) * 6)), 1.6);
    bars.push(
      <rect key={i} x={150 + i * 17} y={868 - hgt} width={3} height={hgt} rx={1.5} fill={i === hot ? C.teal : C.ink} opacity={i === hot ? 1 : 0.2} />,
    );
  }
  const sigIn = prog(f, 8, 16, ease.out) * readOut;

  // --- conversion point: a "sales" dot on the rail swells, then travels to the centre of the next scene
  const dotIn = prog(f, 78, 14, ease.out);
  const travel = prog(f, 112, 24, ease.inOut);
  const P0 = PERF_DOT_START, P1 = pt(1720, 620), P2 = pt(1240, 330), P3 = CONVERSION_END;
  const dotPos = travel > 0 ? bez3(P0, P1, P2, P3, travel) : P0;
  const trailPts = sample((u) => bez3(P0, P1, P2, P3, u), 80);
  const tl = cumLengths(trailPts);
  const trailSeg = slice(trailPts, tl, Math.max(0, travel - 0.42 * Math.min(1, travel * 3)), travel, 50);
  const pulse = prog(f, 82, 22, ease.out);
  const railY = lineY(PERF_DOT_START.x, f, base, amp);
  const dotXY = travel > 0 ? dotPos : {x: PERF_DOT_START.x, y: railY};

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Lattice amount={0.9 * arrive * (1 - prog(f, 104, 20, ease.soft))} drift={-f * 1.6} id="latP" />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <FlowLine pts={line} width={strokeW} opacity={lineOp * (0.55 + 0.45 * arrive)} />
        {threads}
        {gate(G1, 14, 'g1')}
        {gate(G2, 28, 'g2')}
        {dots}
        {/* growth curve */}
        <g opacity={readOut * prog(f, 12, 14, ease.out)}>
          <path d="M1390 872 H1790" stroke={C.ink} strokeWidth={1} opacity={0.14} />
          <FlowLine pts={growthSeg} width={2.4} color={C.ink} opacity={0.85} />
          {gp > 0 && (
            <circle cx={growthSeg[growthSeg.length - 1]?.x} cy={growthSeg[growthSeg.length - 1]?.y} r={5} fill={C.teal} />
          )}
        </g>
        <g opacity={sigIn}>{bars}</g>
        {/* conversion point */}
        {dotIn > 0 && (
          <g>
            <FlowLine pts={trailSeg} width={2.5} opacity={0.9} />
            <circle cx={dotXY.x} cy={dotXY.y} r={10 * dotIn * (travel > 0 ? 0.9 : 1)} fill={C.teal} />
            {travel === 0 && (
              <circle cx={dotXY.x} cy={dotXY.y} r={10 + 34 * pulse} fill="none" stroke={C.teal} strokeWidth={1.6} opacity={(1 - pulse) * 0.9} />
            )}
          </g>
        )}
      </svg>

      {/* counter */}
      <div style={{position: 'absolute', left: 0, width: W, top: 214, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - counterOut, transform: `translateY(${-counterOut * 30}px)`}}>
        <div style={{height: 176, display: 'flex', alignItems: 'center', opacity: prog(f, 9, 10, ease.out)}}>
          <Numeral v={fmt(val)} />
        </div>
        <div style={{height: 14}} />
        <Swap stages={[10, 30, 46]} width={600} height={34} align="center" dur={14}>
          {[<Label key="l1" t="CLICKS" />, <Label key="l2" t="LEADS" />, <Label key="l3" t="SALES" />]}
        </Swap>
      </div>

      {/* gate labels */}
      <GateLabel x={G1} y={lineY(G1, f, base, amp) + 118} text="LEADS" inAt={16} out={56} />
      <GateLabel x={G2} y={lineY(G2, f, base, amp) + 118} text="SALES" inAt={30} out={56} />
      <GateLabel x={420} y={lineY(420, f, base, amp) + 118} text="CLICKS" inAt={8} out={56} />

      {/* readouts */}
      <div style={{position: 'absolute', left: 1390, top: 884, opacity: readOut * prog(f, 22, 16, ease.out), fontFamily: FONT, display: 'flex', gap: 56}}>
        <div>
          <div style={{fontSize: 15, letterSpacing: '0.24em', color: C.mute, fontWeight: 500}}>ROAS</div>
          <div style={{fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>{roas.toFixed(1)}×</div>
        </div>
        <div>
          <div style={{fontSize: 15, letterSpacing: '0.24em', color: C.mute, fontWeight: 500}}>COST / LEAD</div>
          <div style={{fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>₹{fmt(118 * ease.out(prog(f, 22, 26, ease.linear)))}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 884, opacity: sigIn, fontFamily: FONT, fontSize: 15, letterSpacing: '0.24em', color: C.mute, fontWeight: 500}}>
        CAMPAIGN SIGNALS
      </div>

      {/* typography */}
      <MaskLine text="PERFORMANCE" y={395} size={178} inAt={58} outAt={108} outDur={12} inDur={24} />
      <MaskLine text="MARKETING" y={562} size={178} inAt={64} outAt={112} outDur={12} inDur={24} />
      <FlowCaption words={['Attention', 'Leads', 'Revenue']} y={738} inAt={80} outAt={104} />
    </div>
  );
};

const GateLabel: React.FC<{x: number; y: number; text: string; inAt: number; out: number}> = ({x, y, text, inAt, out}) => {
  const f = useCurrentFrame();
  const p = prog(f, inAt, 16, ease.out) * (1 - prog(f, out, 12, ease.soft));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 100,
        width: 200,
        top: y - 12,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 500,
        letterSpacing: '0.28em',
        color: C.mute,
        opacity: p,
        transform: `translateY(${(1 - p) * 8}px)`,
      }}
    >
      {text}
    </div>
  );
};

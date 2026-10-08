import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FONT, W, H} from '../theme';
import {FlowLine} from '../components/FlowLine';
import {MaskLine} from '../components/Type';
import {Lattice} from '../components/Background';
import {ease, prog, lerp, hash, sp, map} from '../lib/ease';
import {Pt, bez3, pt, toD} from '../lib/geom';

export const SALES_LEN = 134;

const CARD = {w: 1060, h: 600};
const ROWS = [
  {lead: 'Price?', reply: 'Here’s the value.'},
  {lead: 'Need details.', reply: 'Here’s the plan.'},
  {lead: 'Will decide later.', reply: 'Follow-up booked.'},
  {lead: 'Interested.', reply: 'Let’s begin.'},
];
const leadW = [150, 236, 288, 214];
const replyW = [236, 218, 262, 190];

// funnel geometry (screen space, before docking)
const STAGES = [
  {x: 300, label: 'ENQUIRY', half: 210},
  {x: 660, label: 'CONVERSATION', half: 165},
  {x: 1020, label: 'FOLLOW-UP', half: 120},
  {x: 1380, label: 'CLOSE', half: 75},
];
const X0 = 110;
const XEND = 1700;
const AXIS = 540;
const hAt = (x: number) => Math.max(46, 247.5 - 0.125 * x);
const LOCK = [50, 56, 62, 68];
const IND_AT = 72;

const ticksFrom = (k: number) => {
  // where the lead bubble's tick sits on screen
  const cardLeft = W / 2 - CARD.w / 2;
  const cardTop = H / 2 - CARD.h / 2;
  return pt(cardLeft + 40 + leadW[k] - 28, cardTop + 150 + 108 * k);
};

export const Sales: React.FC = () => {
  const f = useCurrentFrame();

  // ---- card: grows out of the conversion point
  const open = ease.out(prog(f, 1, 16, ease.linear));
  const close = ease.in(prog(f, 38, 10, ease.linear));
  const tiltY = lerp(-16, -3.5, ease.out(prog(f, 1, 34, ease.linear)));
  const tiltX = lerp(8, 2, ease.out(prog(f, 1, 34, ease.linear)));
  const cardW = lerp(20, CARD.w, open);
  const cardH = lerp(20, CARD.h, open);
  const cardScale = 1 - close * 0.06;
  const cardOp = 1 - close;

  // ---- dock: the funnel slides to the bottom as the title arrives
  const dock = ease.inOut(prog(f, 70, 18, ease.linear));
  const dockScale = lerp(1, 0.62, dock);
  const dockY = lerp(0, 338, dock);
  const hairOp = (1 - dock) * prog(f, 46, 12, ease.out);
  const shiftX = 905;

  // ---- axis line
  const lineHead = lerp(X0 - 60, XEND, ease.inOut(prog(f, 44, 28, ease.linear)));
  const axis: Pt[] = [];
  for (let x = -60; x <= lineHead; x += 12) axis.push(pt(x, AXIS));
  axis.push(pt(lineHead, AXIS));

  // ---- funnel hairlines
  const top: Pt[] = [], bot: Pt[] = [];
  for (let x = X0; x <= XEND; x += 20) {
    top.push(pt(x, AXIS - hAt(x)));
    bot.push(pt(x, AXIS + hAt(x)));
  }

  // ---- dots passing through the funnel
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const reach = hash(i, 11) < 0.1 ? 4 : hash(i, 12) < 0.35 ? 3 : hash(i, 13) < 0.55 ? 2 : hash(i, 14) < 0.6 ? 1 : 0;
    const t0 = 42 + i * 1.0;
    const spd = 26 + hash(i, 15) * 6;
    const x = X0 - 40 + (f - t0) * spd;
    if (x < X0 - 40 || x > XEND + 10) continue;
    const stopX = reach >= 4 ? XEND - 8 : STAGES[reach].x + 40;
    const yo = (hash(i, 16) - 0.5) * 2;
    let y = AXIS + yo * hAt(Math.min(x, stopX)) * 0.82 * (reach >= 4 ? 1 - map(x, STAGES[3].x, XEND - 8, 0, 1) : 1);
    let o = 0.6;
    if (x > stopX) {
      const d = map(x, stopX, stopX + 80, 0, 1);
      y += Math.sign(yo || 1) * d * d * 70;
      o = 0.6 * (1 - d);
    }
    if (o <= 0.01) continue;
    const win = reach >= 4;
    dots.push(<circle key={i} cx={x} cy={y} r={win ? 5.5 : 3.4} fill={win ? C.teal : C.ink} opacity={win ? 1 : o} />);
  }

  // ---- stage nodes
  const nodes = STAGES.map((s, k) => {
    const L = LOCK[k];
    const appear = prog(f, L - 14, 12, ease.out);
    const snap = sp(f, L, {damping: 13, stiffness: 240});
    const locked = f >= L;
    const rot = locked ? (1 - Math.min(1, snap)) * 45 : 45;
    const pulse = prog(f, L, 20, ease.out);
    const size = 40;
    const lblP = prog(f, L - 2, 18, ease.out);
    return (
      <g key={k} transform={`translate(${s.x} ${AXIS})`}>
        {locked && pulse < 1 && <circle r={size * 0.7 + pulse * 44} fill="none" stroke={C.teal} strokeWidth={1.6} opacity={(1 - pulse) * 0.9} />}
        <g opacity={appear} transform={`rotate(${rot}) scale(${lerp(0.7, 1, appear)})`}>
          <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={9} fill={C.bg} stroke={C.ink} strokeOpacity={locked ? 0.9 : 0.3} strokeWidth={2} />
        </g>
        {locked && <rect x={-9} y={-9} width={18} height={18} rx={4} fill={C.ink} transform={`scale(${Math.min(1.1, snap)})`} />}
        {/* corner ticks that snap to position */}
        {locked &&
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy], j) => {
            const d = 33 - 10 * Math.min(1, snap) * 0 + (1 - Math.min(1, snap)) * 16;
            return (
              <path key={j} d={`M${sx * d} ${sy * (d - 9)} V${sy * d} H${sx * (d - 9)}`} stroke={C.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.55 * Math.min(1, snap)} />
            );
          })}
        <text
          y={size / 2 + 44}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={22}
          fontWeight={500}
          letterSpacing="0.26em"
          fill={C.ink}
          opacity={lblP * (locked ? 0.85 : 0.4)}
          transform={`translate(${0.13 * 22} ${(1 - lblP) * 10})`}
        >
          {s.label}
        </text>
      </g>
    );
  });

  // chevrons between stages (the "↓" of the process, laid along the line)
  const chev = STAGES.slice(0, 3).map((s, k) => {
    const mx = (s.x + STAGES[k + 1].x) / 2;
    const p = prog(f, LOCK[k] + 2, 14, ease.out);
    return <path key={k} d={`M${mx - 7} ${AXIS - 11} L${mx + 5} ${AXIS} L${mx - 7} ${AXIS + 11}`} stroke={C.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.45 * p} transform={`translate(${(1 - p) * -8} 0)`} />;
  });

  // ---- final conversion indicator
  const ring = prog(f, IND_AT, 12, ease.inOut);
  const check = prog(f, IND_AT + 8, 9, ease.out);
  const doneP = prog(f, IND_AT + 13, 18, ease.out);
  const R = 46;
  const indicator = (
    <g transform={`translate(${XEND + 8} ${AXIS})`} opacity={prog(f, IND_AT - 6, 8, ease.out)}>
      <circle r={R} fill="none" stroke={C.ink} strokeOpacity={0.12} strokeWidth={2} />
      <circle r={R} fill="none" stroke={C.teal} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${ring * 2 * Math.PI * R} 999`} transform="rotate(-90)" />
      <path d="M-15 1 L-4 13 L16 -12" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} style={{strokeDasharray: 1, strokeDashoffset: 1 - check}} />
      {doneP > 0 && doneP < 1 && <circle r={R + 6 + doneP * 50} fill="none" stroke={C.teal} strokeWidth={1.6} opacity={(1 - doneP) * 0.9} />}
    </g>
  );

  // ---- ticks flying out of the card into the first stage
  const flights = ROWS.map((_, k) => {
    const start = ticksFrom(k);
    const t = ease.inOut(prog(f, 32 + k * 2, 14, ease.linear));
    if (t <= 0 || t >= 1) return null;
    const p = bez3(start, pt(start.x + 100, start.y), pt(STAGES[0].x - 160, AXIS + (k - 1.5) * 40), pt(STAGES[0].x, AXIS), t);
    return <circle key={k} cx={p.x} cy={p.y} r={lerp(11, 6, t)} fill={C.teal} />;
  });

  const rowEls = ROWS.map((row, k) => {
    const tLead = 10 + 6 * k, tReply = tLead + 3, tFix = tLead + 7;
    const pl = prog(f, tLead, 10, ease.out);
    const pr = prog(f, tReply, 10, ease.out);
    const pf = prog(f, tFix, 8, ease.out);
    const y = 150 + 108 * k;
    return (
      <React.Fragment key={k}>
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: y - 32,
            width: leadW[k],
            height: 64,
            borderRadius: 32,
            border: `1.6px solid ${pf > 0.01 ? C.teal : 'rgba(17,17,17,0.2)'}`,
            background: `rgba(79,203,205,${0.1 * pf})`,
            boxSizing: 'border-box',
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            color: `rgba(17,17,17,${0.5 + 0.5 * pf})`,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 26,
            opacity: pl,
            transform: `translateY(${(1 - pl) * 18}px)`,
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
          }}
        >
          {row.lead}
          <svg width={28} height={28} viewBox="-14 -14 28 28" style={{position: 'absolute', right: 14, top: 16, opacity: pf}}>
            <circle r={11} fill={C.teal} transform={`scale(${pf})`} />
            <path d="M-4.5 0.5 L-1.2 4 L5 -3.5" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={pf} />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: y - 32,
            width: replyW[k],
            height: 64,
            borderRadius: 32,
            background: C.ink,
            color: '#fff',
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pr,
            transform: `translateX(${(1 - pr) * 40}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {row.reply}
        </div>
      </React.Fragment>
    );
  });

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Lattice amount={0.6 * prog(f, 0, 14, ease.soft) * (1 - prog(f, 64, 20, ease.soft))} drift={-f * 1.0 + 80} id="latS" />

      {/* conversation card (3D) */}
      <div style={{position: 'absolute', inset: 0, perspective: 1900, opacity: cardOp}}>
        <div
          style={{
            position: 'absolute',
            left: W / 2 - cardW / 2,
            top: H / 2 - cardH / 2,
            width: cardW,
            height: cardH,
            borderRadius: lerp(10, 36, open),
            background: '#FFFFFF',
            border: '1px solid rgba(17,17,17,0.08)',
            boxShadow: '0 50px 100px rgba(17,17,17,0.08), 0 10px 24px rgba(17,17,17,0.05)',
            transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg) scale(${cardScale})`,
            transformStyle: 'preserve-3d',
            overflow: 'hidden',
          }}
        >
          <div style={{position: 'absolute', left: (cardW - CARD.w) / 2, top: (cardH - CARD.h) / 2, width: CARD.w, height: CARD.h, opacity: prog(f, 10, 12, ease.out)}}>
            <div style={{position: 'absolute', left: 40, top: 40, fontFamily: FONT, fontSize: 18, fontWeight: 500, letterSpacing: '0.28em', color: C.mute}}>LEAD</div>
            <div style={{position: 'absolute', right: 40, top: 40, fontFamily: FONT, fontSize: 18, fontWeight: 500, letterSpacing: '0.28em', color: C.mute}}>SALES TEAM</div>
            <div style={{position: 'absolute', left: 40, right: 40, top: 84, height: 1, background: C.hair}} />
            {rowEls}
          </div>
        </div>
      </div>

      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {open < 0.6 && <circle cx={W / 2} cy={H / 2} r={10 * (1 - open / 0.6)} fill={C.teal} />}
        {flights}
        <g opacity={1 - prog(f, 114, 14, ease.soft)} transform={`translate(${W / 2} ${AXIS + dockY}) scale(${dockScale}) translate(${-shiftX} ${-AXIS})`}>
          <g opacity={hairOp}>
            <FlowLine pts={top} width={1.3} color={C.ink} opacity={0.2} />
            <FlowLine pts={bot} width={1.3} color={C.ink} opacity={0.2} />
            {STAGES.map((s, k) => (
              <path key={k} d={`M${s.x} ${AXIS - s.half} V${AXIS + s.half}`} stroke={C.ink} strokeWidth={1.2} opacity={0.14} strokeDasharray="3 7" />
            ))}
          </g>
          <FlowLine pts={axis} width={3 / Math.max(0.7, dockScale)} />
          <g opacity={1 - dock * 0.6}>{dots}</g>
          {chev}
          {nodes}
          {indicator}
        </g>
      </svg>

      <MaskLine text="SALES" y={395} size={178} inAt={78} outAt={116} outDur={12} inDur={24} />
      <MaskLine text="TRAINING" y={562} size={178} inAt={84} outAt={119} outDur={12} inDur={24} />
      <MaskLine text="Turn conversations" y={702} size={36} weight={500} inAt={92} outAt={112} outDur={12} trackFrom={0.04} trackTo={-0.01} lineHeight={1.3} />
      <MaskLine text="into conversions." y={752} size={36} weight={500} inAt={98} outAt={115} outDur={12} color={C.mute} trackFrom={0.04} trackTo={-0.01} lineHeight={1.3} />
    </div>
  );
};

import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, W, H} from '../theme';
import {LogoMark} from '../components/LogoMark';
import {MaskLine} from '../components/Type';
import {ease, prog, lerp} from '../lib/ease';
import {bez3, pt, sample, toD, cumLengths, slice} from '../lib/geom';
import {LOGO_START, LOGO_TIP, logoToScreen} from '../lib/logo';

export const INTRO_PLACE = {cx: 960, cy: 418, size: 600};
const START = logoToScreen(LOGO_START, INTRO_PLACE);
export const INTRO_TIP = logoToScreen(LOGO_TIP, INTRO_PLACE);
/** screen-space angle (deg) the tip leaves the logo at; camera rolls to level it during the push-through */
const TIP_ANGLE = -14;

// the hairline that "enters frame" and becomes the logo
const lead = (u: number) =>
  bez3(pt(-80, 742), pt(300, 640), pt(560, 790), pt(START.x, START.y), u);
const leadPts = sample(lead, 90);
const leadLens = cumLengths(leadPts);

export const Intro: React.FC = () => {
  const f = useCurrentFrame();

  // line enters and is absorbed by the logo's own stroke
  const head = prog(f, 2, 22, ease.soft);
  const tail = prog(f, 14, 24, ease.inOut);
  const leadSeg = slice(leadPts, leadLens, tail, head, 60);

  const thin = prog(f, 14, 36, ease.soft);
  const thick = prog(f, 24, 38, ease.inOut);

  // camera: dolly through the tip of the stroke
  const push = prog(f, 62, 36, ease.inOut);
  const zoom = Math.exp(Math.log(9.5) * push);
  const aim = ease.inOut(prog(f, 62, 22, ease.linear));
  const tx = (W / 2 - INTRO_TIP.x) * aim;
  const ty = (H / 2 - INTRO_TIP.y) * aim;
  const roll = -TIP_ANGLE * aim;
  const fade = 1 - prog(f, 86, 10, ease.soft);
  // the camera drifts after the line as it enters, then settles
  const cam = ease.out(prog(f, 0, 70, ease.linear));
  const drift = `translate(${(1 - cam) * -110}px, ${(1 - cam) * 46}px) scale(${1 + (1 - cam) * 0.07})`;

  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 45%', transform: drift}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: `${INTRO_TIP.x}px ${INTRO_TIP.y}px`,
          transform: `translate(${tx}px, ${ty}px) rotate(${roll}deg) scale(${zoom})`,
        }}
      >
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {leadSeg.length > 1 && (
            <path d={toD(leadSeg)} fill="none" stroke={C.teal} strokeWidth={2 / Math.sqrt(zoom)} strokeLinecap="round" />
          )}
        </svg>
        <LogoMark uid="intro" {...INTRO_PLACE} thick={thick} thin={thin} />
      </div>
      </div>
      <MaskLine text="JAZARA" y={778} size={30} weight={500} inAt={50} outAt={66} outDur={12} trackFrom={0.9} trackTo={0.62} lineHeight={1.4} />
      <MaskLine text="MEDIA GROUP" y={830} size={19} weight={400} color={C.mute} inAt={56} outAt={66} outDur={12} trackFrom={0.8} trackTo={0.5} lineHeight={1.4} />
    </div>
  );
};

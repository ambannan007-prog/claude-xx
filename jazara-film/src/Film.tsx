import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {C, T} from './theme';
import {loadFonts} from './fonts';
import {Intro} from './scenes/Intro';
import {Performance, PERF_LEN} from './scenes/Performance';
import {Influencer, INFL_LEN} from './scenes/Influencer';
import {Sales, SALES_LEN} from './scenes/Sales';
import {Finale, FINALE_LEN} from './scenes/Finale';

loadFonts();

/** windows (global frames) where the camera / line moves fast enough to deserve real motion blur */
const BLUR: [number, number][] = [
  [64, 92],
  [194, 224],
  [342, 368],
  [514, 536],
];

const Scenes: React.FC = () => (
  <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
    <Sequence from={T.intro[0]} durationInFrames={T.intro[1] - T.intro[0]}>
      <Intro />
    </Sequence>
    <Sequence from={T.perf[0]} durationInFrames={PERF_LEN}>
      <Performance />
    </Sequence>
    <Sequence from={T.infl[0]} durationInFrames={INFL_LEN}>
      <Influencer />
    </Sequence>
    <Sequence from={T.sales[0]} durationInFrames={SALES_LEN}>
      <Sales />
    </Sequence>
    <Sequence from={T.finale[0]} durationInFrames={FINALE_LEN}>
      <Finale />
    </Sequence>
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const blur = BLUR.some(([a, b]) => f >= a && f <= b);
  return blur ? (
    <CameraMotionBlur shutterAngle={220} samples={8}>
      <Scenes />
    </CameraMotionBlur>
  ) : (
    <Scenes />
  );
};

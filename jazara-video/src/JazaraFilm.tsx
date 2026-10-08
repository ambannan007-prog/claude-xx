import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {ACT1_END, Act1IntroPerformance} from './scenes/Act1IntroPerformance';
import {ACT2_END, ACT2_START, Act2Influencer} from './scenes/Act2Influencer';
import {ACT3_END, ACT3_START, Act3Sales} from './scenes/Act3Sales';
import {ACT4_START, Act4Finale} from './scenes/Act4Finale';

/**
 * Master timeline (30 fps, 600 frames). Acts read the absolute frame and only
 * overlap where a shared object hands off — conversion point → brand hub →
 * conversation point → three paths → logo — so the film plays as one shot.
 */
export const JazaraFilm: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      {f < ACT1_END ? <Act1IntroPerformance /> : null}
      {f >= ACT2_START && f < ACT2_END ? <Act2Influencer /> : null}
      {f >= ACT3_START && f < ACT3_END ? <Act3Sales /> : null}
      {f >= ACT4_START ? <Act4Finale /> : null}
    </AbsoluteFill>
  );
};

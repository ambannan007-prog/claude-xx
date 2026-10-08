import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './fonts';
import {JazaraFilm} from './JazaraFilm';
import {VIDEO} from './theme';

loadFonts();

export const RemotionRoot: React.FC = () => (
  <Composition
    id="JazaraBrandFilm"
    component={JazaraFilm}
    durationInFrames={VIDEO.durationInFrames}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);

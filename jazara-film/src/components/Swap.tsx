import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, prog} from '../lib/ease';

/**
 * Vertical swap inside a clipped slot: the previous child leaves upward while the next one rises in.
 * `stages` are the local frames at which each child becomes current.
 */
export const Swap: React.FC<{
  stages: number[];
  children: React.ReactNode[];
  height: number;
  width: number;
  dur?: number;
  align?: 'center' | 'left';
}> = ({stages, children, height, width, dur = 16, align = 'left'}) => {
  const f = useCurrentFrame();
  let idx = -1;
  for (let i = 0; i < stages.length; i++) if (f >= stages[i]) idx = i;
  const sinceStart = idx >= 0 ? prog(f, stages[idx], dur, ease.out) : 0;
  const slot = (child: React.ReactNode, ty: number, o: number, key: string) => (
    <div
      key={key}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        transform: `translateY(${ty}%)`,
        opacity: o,
      }}
    >
      {child}
    </div>
  );
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden'}}>
      {idx >= 1 && sinceStart < 1 && slot(children[idx - 1], -sinceStart * 105, 1 - sinceStart, 'prev')}
      {idx >= 0 && slot(children[idx], (1 - sinceStart) * 105, idx === 0 ? sinceStart : 0.2 + 0.8 * sinceStart, 'cur')}
    </div>
  );
};

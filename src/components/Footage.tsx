import React from 'react';
import { Video } from '@remotion/media';
import { staticFile } from 'remotion';

/** Captured clips from footage/ (see capture/). */
export type ClipName =
  | 'im-entrada'
  | 'im-arvore'
  | 'lancheria-trilho'
  | 'lancheria-raiox'
  | 'he-quadro'
  | 'he-circuitos'
  | 'he-multimetro'
  | 'vg-desktop'
  | 'vg-mobile';

type Props = {
  clip: ClipName;
  /** First frame of the clip to show. */
  trimBefore?: number;
  playbackRate?: number;
  style?: React.CSSProperties;
  fit?: 'cover' | 'contain' | 'fill';
};

export const Footage: React.FC<Props> = ({ clip, trimBefore = 0, playbackRate = 1, style, fit = 'cover' }) => (
  <Video
    src={staticFile(`footage/${clip}.mp4`)}
    trimBefore={trimBefore}
    playbackRate={playbackRate}
    muted
    objectFit={fit}
    style={{ width: '100%', height: '100%', ...style }}
  />
);

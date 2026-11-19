// Shared by every scene of the restaurant commercial: copy context, captions, helpers.
import React from 'react';
import { brand } from '../config/branding';
import { locales } from '../locales';
import { Line } from '../src/components/Type';
import type { Aspect, Variant } from './config';
import type { Pt } from './parts';

export const C = brand.colors;

/** Desktop takes in 16:9 and 1:1; phone takes in 9:16. */
export const desktop = (a: Aspect) => a !== '9x16';

/** Proper names of the four variants (they are names, so they stay as they are in every language). */
export const NAMES: Record<Variant, string> = { chapa: 'Chapa', balcao: 'Balcão', sala: 'Sala', praca: 'Praça' };

/** The commercial's copy for the current locale (locales/*.ts → restaurant). */
export const MessagesContext = React.createContext(locales.en.restaurant);
export const useMessages = () => React.useContext(MessagesContext);

export type Caption = { x: number; y: number; size: number; max: number; align?: 'left' | 'center' };
export const CAPTIONS: Record<Aspect, { hook: Caption; tag: Pt; title: Caption; variantTag: Pt; bridge: Caption; bridgeTag: Pt }> = {
  '16x9': {
    hook: { x: 110, y: 800, size: 92, max: 1500 },
    tag: { x: 112, y: 936 },
    title: { x: 110, y: 838, size: 70, max: 1500 },
    variantTag: { x: 112, y: 946 },
    bridge: { x: 110, y: 430, size: 96, max: 900 },
    bridgeTag: { x: 112, y: 560 },
  },
  '1x1': {
    hook: { x: 64, y: 806, size: 60, max: 950 },
    tag: { x: 66, y: 918 },
    title: { x: 64, y: 806, size: 56, max: 950 },
    variantTag: { x: 66, y: 918 },
    bridge: { x: 64, y: 180, size: 72, max: 950 },
    bridgeTag: { x: 66, y: 290 },
  },
  '9x16': {
    hook: { x: 64, y: 150, size: 76, max: 960 },
    tag: { x: 66, y: 282 },
    title: { x: 64, y: 150, size: 70, max: 960 },
    variantTag: { x: 66, y: 282 },
    bridge: { x: 0, y: 470, size: 84, max: 960, align: 'center' },
    bridgeTag: { x: 330, y: 600 },
  },
};

export const Caption: React.FC<{ cap: Caption; text: string; at: number; out?: number; underline?: string; color?: string; width: number }> = ({ cap, text, at, out, underline, color, width }) => (
  <div style={{ position: 'absolute', left: cap.align === 'center' ? 0 : cap.x, top: cap.y, width: cap.align === 'center' ? width : undefined }}>
    <Line text={text} at={at} out={out} size={cap.size} maxWidth={cap.max} underline={underline} color={color} align={cap.align ?? 'left'} />
  </div>
);


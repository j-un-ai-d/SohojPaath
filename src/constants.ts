import { ReadingSettings } from "./types";

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 20,
  lineHeight: 1.8,
  letterSpacing: 0.05,
  wordSpacing: 0.1,
  paragraphWidth: 100,
  fontFamily: 'OpenDyslexic, sans-serif',
  theme: 'light',
  overlayColor: null,
  lineFocus: false,
  readingRuler: false,
  segmentedView: false,
  ttsSpeed: 1.0,
  voice: null,
};

export const THEMES = {
  light:          { bg: 'bg-[#F3F4F6]', text: 'text-[#111827]', card: 'bg-white' },
  dark:           { bg: 'bg-[#020617]', text: 'text-slate-100',  card: 'bg-slate-900' },
  sepia:          { bg: 'bg-[#F4ECD8]', text: 'text-[#5B4636]',  card: 'bg-[#EFE4CF]' },
  'high-contrast':{ bg: 'bg-black',     text: 'text-yellow-400', card: 'bg-zinc-900' },
  'blue-light':   { bg: 'bg-[#1a1200]', text: 'text-[#ffd580]',  card: 'bg-[#231800]' },
};

// OpenDyslexic is first and self-hosted in /public/fonts/
export const FONTS = [
  { name: 'OpenDyslexic',      value: 'OpenDyslexic, sans-serif' },
  { name: 'Inter',             value: 'Inter, sans-serif' },
  { name: 'Atkinson',         value: '"Atkinson Hyperlegible", sans-serif' },
  { name: 'Lexend',            value: 'Lexend, sans-serif' },
  { name: 'Nunito',            value: 'Nunito, sans-serif' },
  { name: 'Verdana',           value: 'Verdana, Geneva, sans-serif' },
  { name: 'Arial',             value: 'Arial, Helvetica, sans-serif' },
  { name: 'Trebuchet',         value: '"Trebuchet MS", sans-serif' },
  { name: 'Century Gothic',    value: '"Century Gothic", "Apple Gothic", sans-serif' },
  { name: 'Noto Bengali',      value: '"Noto Sans Bengali", sans-serif' },
];

// None is first so the default is no overlay
export const OVERLAY_COLORS = [
  { name: 'None',     value: null },
  { name: 'Blue',     value: 'rgba(147, 197, 253, 0.18)' },
  { name: 'Yellow',   value: 'rgba(253, 224,  71, 0.18)' },
  { name: 'Green',    value: 'rgba(134, 239, 172, 0.18)' },
  { name: 'Pink',     value: 'rgba(249, 168, 212, 0.18)' },
  { name: 'Peach',    value: 'rgba(254, 215, 170, 0.20)' },
  { name: 'Lavender', value: 'rgba(196, 181, 253, 0.18)' },
  { name: 'Mint',     value: 'rgba(110, 231, 183, 0.15)' },
  { name: 'Amber',    value: 'rgba(251, 191,  36, 0.15)' },
  { name: 'Cream',    value: 'rgba(255, 243, 220, 0.20)' },
  { name: 'Slate',    value: 'rgba(148, 163, 184, 0.15)' },
  { name: 'Rose',     value: 'rgba(255, 182, 193, 0.15)' },
];

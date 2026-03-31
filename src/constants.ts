import { ReadingSettings } from "./types";

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 20,
  lineHeight: 1.8,
  letterSpacing: 0.05,
  wordSpacing: 0.1,
  paragraphWidth: 100,
  fontFamily: 'Inter',
  theme: 'light',
  overlayColor: null,
  lineFocus: false,
  readingRuler: false,
  segmentedView: false,
  ttsSpeed: 1.0,
  voice: null,
};

export const THEMES = {
  light: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#111827]',
    card: 'bg-white',
  },
  dark: {
    bg: 'bg-[#020617]',
    text: 'text-slate-100',
    card: 'bg-slate-900',
  },
  sepia: {
    bg: 'bg-[#F4ECD8]',
    text: 'text-[#5B4636]',
    card: 'bg-[#EFE4CF]',
  },
  'high-contrast': {
    bg: 'bg-black',
    text: 'text-yellow-400',
    card: 'bg-zinc-900',
  },
};

export const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'OpenDyslexic', value: 'OpenDyslexic, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Noto Sans Bengali', value: 'Noto Sans Bengali, sans-serif' },
];

export const OVERLAY_COLORS = [
  { name: 'None', value: null },
  { name: 'Blue', value: 'rgba(29, 78, 216, 0.1)' },
  { name: 'Yellow', value: 'rgba(245, 158, 11, 0.1)' },
  { name: 'Green', value: 'rgba(5, 150, 105, 0.1)' },
  { name: 'Pink', value: 'rgba(219, 39, 119, 0.1)' },
];

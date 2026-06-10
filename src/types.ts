export type Language = 'en' | 'bn';

export interface UserPreferences {
  language: 'en' | 'bn' | 'both';
  assistanceLevel: 'light' | 'moderate' | 'full';
  theme: 'light' | 'dark';
  onboardingComplete: boolean;
}

export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphWidth: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast' | 'blue-light';
  overlayColor: string | null;
  lineFocus: boolean;
  readingRuler: boolean;
  segmentedView: boolean;
  ttsSpeed: number;
  voice: string | null;
}

export interface ReadingSession {
  id: string;
  title: string;
  language: Language;
  timestamp: number;
  duration: number;   // seconds
  wordsRead: number;
  completed: boolean;
}

export interface ScreeningResult {
  id: string;
  timestamp: number;
  track: 'A' | 'B';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  probability?: number;      // Track A only
  predictedClass?: string;   // Track B only
  confidence?: number;       // Track B only
}

export interface UserStats {
  streak: number;
  lastReadDate: string;  // ISO date string "YYYY-MM-DD"
  totalTime: number;     // seconds
  totalWords: number;
  sessions: ReadingSession[];
  screeningHistory: ScreeningResult[];
}
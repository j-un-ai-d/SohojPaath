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
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast';
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
  duration: number;   
  wordsRead: number;
  completed: boolean;
}

export interface UserStats {
  streak: number;
  lastReadDate: string;  
  totalTime: number;     
  totalWords: number;
  sessions: ReadingSession[];
}
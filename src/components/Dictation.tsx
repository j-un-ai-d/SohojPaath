import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Copy, 
  Trash2, 
  BookOpen, 
  Check, 
  AlertCircle,
  MessageSquare,
  Languages,
  Edit3
} from 'lucide-react';
import { cn } from '../lib/utils';

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface DictationProps {
  onSendToReader?: (text: string) => void;
}

export const Dictation: React.FC<DictationProps> = ({ onSendToReader }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lang, setLang] = useState<'en-US' | 'bn-BD'>('en-US');
  const [copied, setCopied] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInterimTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const copyToClipboard = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const sendToReader = () => {
    if (!transcript) return;
    if (onSendToReader) {
      onSendToReader(transcript);
    }
  };

  if (!isSupported) {
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/20 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">Browser Not Supported</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Speech recognition is not supported in this browser. Please try using a modern version of Chrome or Edge for the best experience.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Try Refreshing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold mb-3 dark:text-white">Speech-to-Text Dictation</h2>
        <p className="text-slate-500 dark:text-slate-400">Compose your thoughts verbally. SohojPaath transcribes for you.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-black/5 dark:border-white/5 text-center space-y-6">
        {/* mic button */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <button 
              onClick={toggleRecording}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4",
                isRecording
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-500 scale-110 shadow-lg shadow-indigo-500/20"
                  : "bg-primary/5 dark:bg-primary/10 border-primary text-primary hover:scale-105"
              )}
            >
              {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
            </button>
            

          </div>

          <div>
            <p className={cn("text-xl font-bold mb-1", isRecording ? "text-indigo-500" : "dark:text-white")}>
              {isRecording ? 'Listening...' : 'Tap to start'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRecording ? 'Speak clearly into your microphone' : 'Your voice will be converted to text'}
            </p>
            {isRecording && (
              <div className="flex items-center justify-center gap-1 mt-3 h-6">
                {[1,2,3,4,5,6,5,4,3,2,1].map((h,i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.6 + (i % 3) * 0.15, delay: i * 0.07 }}
                    className="w-1 bg-indigo-400 rounded-full origin-bottom"
                    style={{ height: '20px' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* language toggle */}
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
            <button 
              onClick={() => setLang('en-US')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                lang === 'en-US' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('bn-BD')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                lang === 'bn-BD' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"
              )}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* transcript */}
        <div className="relative group">
          <div className="w-full h-[136px] overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 text-left border border-black/5 dark:border-white/5">
            {transcript || interimTranscript ? (
              <p className="text-lg leading-relaxed dark:text-slate-200">
                {transcript}
                {interimTranscript && (
                  <span className="italic opacity-50 ml-1">{interimTranscript}</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Your transcription will appear here as you speak...
              </p>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={copyToClipboard}
            disabled={!transcript}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-2xl font-bold text-sm shadow-lg shadow-black/5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:text-white"
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          
          <button 
            onClick={clearTranscript}
            disabled={!transcript && !interimTranscript}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-2xl font-bold text-sm shadow-lg shadow-black/5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:text-white"
          >
            <Trash2 size={18} />
            Clear
          </button>

          <button 
            onClick={sendToReader}
            disabled={!transcript}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <BookOpen size={18} />
            Send to Reader
          </button>
        </div>
      </div>

      {/* tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: MessageSquare, title: 'Clear Speech', desc: 'Speak at a natural pace for better accuracy.' },
          { icon: Languages, title: 'Bilingual', desc: 'Switch languages to dictate in English or Bengali.' },
          { icon: Edit3, title: 'Edit After', desc: 'Copy your text to refine it in any document.' },
        ].map((tip, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-2">
              <tip.icon size={20} />
            </div>
            <h4 className="font-bold mb-1 dark:text-white">{tip.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

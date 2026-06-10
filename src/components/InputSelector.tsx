import React, { useState } from 'react';
import { 
  Camera, 
  Link as LinkIcon, 
  FileText, 
  BookOpen,
  Globe,
  FolderOpen,
  Loader2,
  Lightbulb,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';

interface InputSelectorProps {
  onContentReady: (content: string, title: string, language: 'en' | 'bn') => void;
}

export const InputSelector: React.FC<InputSelectorProps> = ({ onContentReady }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'url' | 'manual'>('manual');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchTab = (tab: 'scan' | 'url' | 'manual') => {
    setActiveTab(tab);
    setError(null);
  };

  const handleManualSubmit = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    try {
      const isBengali = /[\u0980-\u09FF]/.test(inputValue);
      onContentReady(inputValue, "New Reading Session", isBengali ? 'bn' : 'en');
    } catch (err) {
      setError("Failed to process text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch the URL.');
        return;
      }
      const isBengali = /[\u0980-\u09FF]/.test(data.text);
      onContentReady(data.text, data.title || inputValue, isBengali ? 'bn' : 'en');
    } catch (err: any) {
      const isNetworkError = err instanceof TypeError;
      setError(
        isNetworkError
          ? 'Could not reach the Flask server. Make sure dyslexia_api.py is running on port 5000.'
          : 'Failed to fetch the URL. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:5000/ocr', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'OCR failed. Please try another image.');
        return;
      }

      const text: string = data.text;
      const isBengali = /[\u0980-\u09FF]/.test(text);
      onContentReady(text, file.name.replace(/\.[^.]+$/, ''), isBengali ? 'bn' : 'en');
    } catch (err: any) {
      const isNetworkError = err instanceof TypeError;
      setError(
        isNetworkError
          ? 'Could not reach the Flask server. Make sure dyslexia_api.py is running on port 5000.'
          : err.message || 'OCR failed. Please try another image.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-black/5 dark:border-white/10">
        {/* tabs */}
        <div className="flex border-b border-black/5">
          <button 
            onClick={() => switchTab('scan')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'scan' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <Camera size={20} />
            <span className="text-xs font-bold uppercase">Scan</span>
          </button>
          <button 
            onClick={() => switchTab('url')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'url' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <LinkIcon size={20} />
            <span className="text-xs font-bold uppercase">URL</span>
          </button>
          <button 
            onClick={() => switchTab('manual')}
            className={cn(
              "flex-1 py-4 flex flex-col items-center gap-1 transition-colors",
              activeTab === 'manual' ? "bg-primary/5 text-primary border-b-2 border-primary" : "hover:bg-black/5 dark:hover:bg-white/5 dark:text-slate-400"
            )}
          >
            <FileText size={20} />
            <span className="text-xs font-bold uppercase">Type</span>
          </button>
        </div>

        {/* content */}
        <div className="p-8">
          {activeTab === 'scan' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Camera size={32} />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold dark:text-white">Scan Printed Text</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload a photo of a book page or document</p>
              </div>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer">
                <FolderOpen size={18} />
                Choose File
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-display font-bold dark:text-white">Read from Web</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Paste a link to an article or blog post</p>
              </div>
              <div className="flex gap-4">
                <input 
                  type="url" 
                  placeholder="https://example.com/article"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 text-sm px-4 py-[11px] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button 
                  onClick={inputValue.trim() && !isLoading ? handleUrlSubmit : undefined}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform whitespace-nowrap",
                    (!inputValue.trim() || isLoading) && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Globe size={18} />
                  Fetch
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-display font-bold dark:text-white">Type or Paste</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter the text you want to read</p>
              </div>
              <textarea 
                rows={6}
                placeholder="Start typing here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex justify-center">
                <button 
                  onClick={handleManualSubmit}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <BookOpen size={18} />
                  Send to Reader
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-primary text-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>Processing…</span>
            </div>
          )}

          {error && (
            <div className="mt-4 max-h-32 overflow-y-auto text-xs bg-red-50 rounded-lg p-3 border border-red-200 text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-3 items-start">
          <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>Pro Tip:</strong> Try scanning a page with Bengali or English text. SohojPaath will convert it to readable text instantly using offline OCR — no internet required.
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex gap-3 items-start">
          <Eye size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            <strong>Accessibility:</strong> Our reader supports OpenDyslexic font and adjustable line spacing to reduce visual stress.
          </p>
        </div>
      </div>
    </div>
  );
};

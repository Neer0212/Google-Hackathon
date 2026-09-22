'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, Translation } from '@/services/db';
import AudioButton from '@/components/AudioButton';
import { Loader2, Send, Wand2, Mic } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

const TEMPLATES = [
  { id: 'general', label: 'General', text: 'Dear Students and Parents, please note that...' },
  { id: 'homework', label: 'Homework', text: 'Reminder for students: The [Subject] homework is due on [Date]. Please ensure it is completed.' },
  { id: 'exam', label: 'Exam', text: 'The upcoming examination for [Subject] will be held on [Date]. Students are advised to prepare well.' },
  { id: 'meeting', label: 'Parent Meeting', text: 'A parent-teacher meeting is scheduled for [Date] at [Time] in [Location]. We look forward to seeing you.' },
  { id: 'holiday', label: 'Holiday', text: 'The school will remain closed on [Date] on account of [Occasion]. Regular classes will resume on [Next Date].' },
];

export default function CreateAnnouncement() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'hi', 'gu']);
  const [enhance, setEnhance] = useState(true);
  const [simple, setSimple] = useState(true);
  const [tone, setTone] = useState('Professional');
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessage(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Your browser doesn't support voice input.");
        return;
      }
      setMessage('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    detectedLanguage: string;
    enhancedMessage: string;
    translations: Translation[];
  } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const toggleLanguage = (code: string) => {
    setSelectedLangs(prev => 
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  const applyTemplate = (text: string) => {
    setMessage(text);
  };

  const handleGenerate = async () => {
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    if (selectedLangs.length === 0) {
      setError('Please select at least one language.');
      return;
    }
    setError('');
    setIsGenerating(true);

    try {
      const targetLanguages = selectedLangs.map(
        code => AVAILABLE_LANGUAGES.find(l => l.code === code)?.name || code
      );

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: message,
          targetLanguages,
          enhance,
          simple,
          tone
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');
      
      const data = await res.json();
      setGeneratedData(data);
    } catch (err: any) {
      setError('Something went wrong while generating your translations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedData) return;
    setIsPublishing(true);
    try {
      await dbService.saveMessage({
        classId: 'class-10a', // Hardcoded for MVP
        originalText: message,
        detectedLanguage: generatedData.detectedLanguage,
        enhancedMessage: generatedData.enhancedMessage,
        type: 'general', // Simplified for MVP
        createdAt: Date.now(),
        translations: generatedData.translations,
      });
      router.push('/teacher/history');
    } catch (err) {
      setError('Failed to publish. Please try again.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Create Announcement</h1>
        <p className="text-slate-500 mt-2">Write your message once, let AI translate and format it for everyone.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-slate-700">Message</label>
              <button 
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                title={isListening ? "Stop listening" : "Use voice input"}
              >
                <Mic size={16} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs text-slate-400 font-medium py-1">Templates:</span>
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.text)}
                  className="text-xs bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded transition-colors whitespace-nowrap"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <textarea
              className="w-full border border-slate-300 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
              placeholder="E.g. Reminder for students: The science project is due tomorrow at 9 AM."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Target Languages</label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <label 
                key={lang.code}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedLangs.includes(lang.code) 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedLangs.includes(lang.code)}
                  onChange={() => toggleLanguage(lang.code)}
                />
                <span className="font-medium text-sm">{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              checked={enhance}
              onChange={(e) => setEnhance(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Wand2 size={16} className="text-indigo-500" /> AI Enhancement
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              checked={simple}
              onChange={(e) => setSimple(e.target.checked)}
            />
            <span className="text-sm font-medium text-slate-700">Simple Language</span>
          </label>
          
          {enhance && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-slate-500">Tone:</span>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-white"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Urgent">Urgent</option>
                <option value="Encouraging">Encouraging</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !message.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {isGenerating ? 'Creating announcement...' : 'Generate Announcement'}
          </button>
        </div>
      </div>

      {generatedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Review & Publish</h2>
            {generatedData.detectedLanguage && (
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                Detected: {generatedData.detectedLanguage}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {generatedData.translations.map((t) => (
              <div key={t.languageCode} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-800">{t.language}</h3>
                  <AudioButton text={t.text} languageCode={t.languageCode} />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{t.text}</p>
                {t.romanized && (
                  <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-100 font-mono">
                    {t.romanized}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setGeneratedData(null)}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Publish Announcement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

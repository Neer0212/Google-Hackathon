'use client';

import { useEffect, useState } from 'react';
import { dbService, Classroom, Message } from '@/services/db';
import AudioButton from '@/components/AudioButton';
import { use } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi / हिंदी' },
  { code: 'gu', name: 'Gujarati / ગુજરાતી' },
  { code: 'mr', name: 'Marathi / मराठी' },
  { code: 'bn', name: 'Bengali / বাংলা' },
  { code: 'ta', name: 'Tamil / தமிழ்' },
  { code: 'te', name: 'Telugu / తెలుగు' },
];

export default function ParentMode({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage if available
    const savedLang = localStorage.getItem('classbridge_parent_lang');
    if (savedLang) setSelectedLanguage(savedLang);

    // Initial fetch
    dbService.loadLocalMockData();
    Promise.all([
      dbService.getClassroom(resolvedParams.classId),
      dbService.getMessages(resolvedParams.classId)
    ]).then(([cls, msgs]) => {
      setClassroom(cls);
      setMessages(msgs);
      setIsLoading(false);
    });
  }, [resolvedParams.classId]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    localStorage.setItem('classbridge_parent_lang', lang);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading classroom...</div>;
  }

  if (!classroom) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Classroom not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-6 shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-center">{classroom.name}</h1>
        
        {/* Language Selector */}
        <div className="mt-5 max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe size={18} className="text-indigo-200" />
            </div>
            <select 
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full bg-white text-indigo-900 text-base py-3 pl-11 pr-10 rounded-xl font-bold shadow-sm focus:ring-4 focus:ring-indigo-300 appearance-none border-none outline-none cursor-pointer transition-shadow"
            >
              {AVAILABLE_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown size={20} className="text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {messages.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-500 border border-slate-200">
            No announcements yet.
          </div>
        ) : (
          <>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">Latest Announcements</h2>
            
            {messages.map((msg, index) => {
              // Try to find translation, fallback to English, then original
              const translation = msg.translations.find(t => t.languageCode === selectedLanguage) 
                               || msg.translations.find(t => t.languageCode === 'en');
              
              const textToDisplay = translation ? translation.text : msg.originalText;
              const isLatest = index === 0;

              return (
                <div key={msg.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isLatest ? 'border-indigo-200 shadow-indigo-100 ring-1 ring-indigo-50' : 'border-slate-200'}`}>
                  <div className={`px-5 py-3 border-b ${isLatest ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'} flex justify-between items-center`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLatest ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {isLatest && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>}
                  </div>
                  
                  <div className="p-5">
                    <p className="text-slate-800 text-lg leading-relaxed">{textToDisplay}</p>
                    
                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                      {translation ? (
                        <AudioButton text={translation.text} languageCode={translation.languageCode} />
                      ) : (
                        <span className="text-xs text-slate-400">Audio unavailable in this language</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

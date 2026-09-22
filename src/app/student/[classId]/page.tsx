'use client';

import { useEffect, useState } from 'react';
import { dbService, Classroom, Message } from '@/services/db';
import AudioButton from '@/components/AudioButton';
import StudentCalendar from '@/components/StudentCalendar';
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

export default function StudentClassroomPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    // Try to load saved language
    const saved = localStorage.getItem('classbridge_student_lang');
    if (saved && AVAILABLE_LANGUAGES.some(l => l.code === saved)) {
      setSelectedLanguage(saved);
    }
  }, []);

  useEffect(() => {
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
    localStorage.setItem('classbridge_student_lang', lang);
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
      <div className="bg-emerald-600 text-white px-4 py-6 shadow-md sticky top-0 z-10">
        <div className="text-center mb-1"><span className="bg-emerald-800 text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wider">Student Portal</span></div>
        <h1 className="text-2xl font-bold tracking-tight text-center">{classroom.name}</h1>
        
        {/* Language Selector */}
        <div className="mt-5 max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe size={18} className="text-emerald-200" />
            </div>
            <select 
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full bg-white text-emerald-900 text-base py-3 pl-11 pr-10 rounded-xl font-bold shadow-sm focus:ring-4 focus:ring-emerald-300 appearance-none border-none outline-none cursor-pointer transition-shadow"
            >
              {AVAILABLE_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <ChevronDown size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Whimsical Calendar Component */}
        <StudentCalendar />

        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Latest Announcements</h2>
        <div className="space-y-6">
          {messages.map((msg, index) => {
            // Find translation for selected language, fallback to English, then original
            const translation = msg.translations?.find(t => t.languageCode === selectedLanguage) || 
                                msg.translations?.find(t => t.languageCode === 'en');
            
            const displayDate = new Date(msg.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
            const isLatest = index === 0;

            return (
              <div key={msg.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isLatest ? 'border-emerald-200 shadow-emerald-100 ring-1 ring-emerald-50' : 'border-slate-200'}`}>
                <div className={`px-5 py-3 border-b flex justify-between items-center ${isLatest ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isLatest ? 'text-emerald-600' : 'text-slate-500'}`}>{displayDate}</span>
                  {isLatest && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    New
                  </span>}
                </div>
                <div className="p-6">
                  <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                    {translation ? translation.text : msg.originalText}
                  </p>
                  
                  <div className="mt-6 flex justify-end">
                    <AudioButton 
                      text={translation ? translation.text : msg.originalText} 
                      languageCode={selectedLanguage}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
              No announcements yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
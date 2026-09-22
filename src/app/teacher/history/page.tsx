'use client';
import { useEffect, useState } from 'react';
import { dbService, Message } from '@/services/db';
import AudioButton from '@/components/AudioButton';
import { Search } from 'lucide-react';

export default function MessageHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const classId = 'class-10a';

  useEffect(() => {
    dbService.loadLocalMockData();
    dbService.getMessages(classId).then(setMessages);
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Message History</h1>
          <p className="text-slate-500 mt-1">View past announcements</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
            No history found.
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="text-sm font-medium text-slate-500">
                  {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
                {msg.enhancedMessage && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-medium">
                    AI Enhanced
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="text-slate-800 font-medium mb-4">{msg.originalText}</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  {msg.translations.map(t => (
                    <div key={t.languageCode} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase">{t.language}</span>
                        <p className="text-sm text-slate-700 mt-1">{t.text}</p>
                      </div>
                      <AudioButton text={t.text} languageCode={t.languageCode} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { dbService, Classroom, Message } from '@/services/db';
import Link from 'next/link';
import { MessageSquare, QrCode, ArrowRight } from 'lucide-react';

export default function TeacherDashboard() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const classId = 'class-10a'; // Hardcoded for MVP as per requirements

  useEffect(() => {
    dbService.loadLocalMockData();
    dbService.getClassroom(classId).then(setClassroom);
    dbService.getMessages(classId).then(setMessages);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Welcome back, Teacher</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Announcements</h3>
          <p className="text-3xl font-bold text-slate-800 mt-1">{messages.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
            <QrCode size={24} />
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Classroom Code</h3>
          <p className="text-xl font-bold text-slate-800 mt-1">{classroom?.name || 'Class 10A'}</p>
          <Link href="/teacher/qr" className="text-purple-600 text-sm font-medium mt-2 inline-flex items-center hover:underline">
            View QR Code <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2">Need to reach parents?</h3>
          <p className="text-indigo-100 text-sm mb-4">Create a multilingual announcement in seconds.</p>
          <Link href="/teacher/create" className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm text-center hover:bg-indigo-50 transition-colors mt-auto">
            Create Announcement
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Recent Announcements</h2>
          <Link href="/teacher/history" className="text-indigo-600 text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No announcements yet. Create one!</div>
          ) : (
            messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md uppercase tracking-wider">
                    {msg.type.replace('-', ' ')}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-800 mb-3 font-medium line-clamp-2">{msg.originalText}</p>
                <div className="flex flex-wrap gap-2">
                  {msg.translations.map(t => (
                    <span key={t.languageCode} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded">
                      {t.language}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

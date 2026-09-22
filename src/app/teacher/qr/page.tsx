'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Link as LinkIcon } from 'lucide-react';

export default function QRPage() {
  const classId = 'class-10a';
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/c/${classId}`);
  }, [classId]);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Classroom QR Code</h1>
        <p className="text-slate-500 mt-2">Print this QR and place it on your classroom notice board. It never changes.</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 inline-block print:border-none print:shadow-none w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Class 10A</h2>
          <p className="text-slate-500 text-sm mt-1">Official Announcement Board</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Parent QR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
          <div className="bg-indigo-50 text-indigo-700 font-medium px-4 py-1.5 rounded-full text-sm mb-6">
            Parent Portal
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? `${window.location.origin}/parent/${classId}` : ''}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Parents QR Code</h2>
          <p className="text-slate-500 mb-6">
            Share this with parents. They can scan it to instantly view all announcements in their preferred language.
          </p>
          
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon size={16} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/parent/${classId}` : ''}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-2.5"
            />
          </div>
        </div>

        {/* Student QR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center">
          <div className="bg-emerald-50 text-emerald-700 font-medium px-4 py-1.5 rounded-full text-sm mb-6">
            Student Portal
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? `${window.location.origin}/student/${classId}` : ''}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#047857"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Students QR Code</h2>
          <p className="text-slate-500 mb-6">
            Share this with students. They can scan it to instantly view all announcements in their preferred language.
          </p>
          
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon size={16} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/student/${classId}` : ''}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-10 p-2.5"
            />
          </div>
        </div>

      </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Printer size={18} /> Print QR
        </button>
        <button 
          onClick={copyLink}
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          <LinkIcon size={18} /> Copy Link
        </button>
      </div>
    </div>
  );
}

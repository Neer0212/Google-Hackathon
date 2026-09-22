import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, PenSquare, History, QrCode, Settings } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            ClassBridge
          </Link>
          <p className="text-sm text-slate-500 mt-1">Teacher Dashboard</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem href="/teacher" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/teacher/create" icon={<PenSquare size={20} />} label="Create Announcement" />
          <NavItem href="/teacher/history" icon={<History size={20} />} label="History" />
          <NavItem href="/teacher/qr" icon={<QrCode size={20} />} label="Classroom QR" />
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <NavItem href="/teacher/settings" icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ClassBridge
          </Link>
          <Link href="/teacher/create" className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            + New
          </Link>
        </header>
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

import Link from 'next/link';
import { Globe2, Volume2, QrCode, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <Globe2 className="text-indigo-600" />
          ClassBridge
        </div>
        <Link href="/teacher" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors">
          Teacher Login
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          One message. <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Every language.</span> <br className="hidden md:block"/>
          Everyone included.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          AI-powered multilingual communication between teachers, students, and parents. Write once, translate instantly, and share via a permanent classroom QR code.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Link href="/teacher" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-1">
            Teacher Dashboard
          </Link>
          <Link href="/parent/class-10a" className="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            Parent Portal (Demo)
          </Link>
          <Link href="/student/class-10a" className="bg-white text-emerald-600 border border-emerald-200 px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            Student Portal (Demo)
          </Link>
        </div>

        {/* Feature visualization */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <FeatureCard 
            icon={<Globe2 size={32} className="text-blue-500" />}
            title="1. Write Message"
            desc="Teacher writes one announcement in their preferred language."
          />
          <FeatureCard 
            icon={<span className="text-3xl">✨</span>}
            title="2. AI Translates"
            desc="Gemini instantly translates and enhances the message into 5+ languages."
          />
          <FeatureCard 
            icon={<QrCode size={32} className="text-purple-500" />}
            title="3. Permanent QR"
            desc="Students and parents scan the classroom's permanent QR code to view."
          />
          <FeatureCard 
            icon={<Volume2 size={32} className="text-green-500" />}
            title="4. Listen & Read"
            desc="Everyone can read or listen to the announcement in their language."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center md:items-start md:text-left relative">
      <div className="mb-4 bg-slate-50 p-3 rounded-xl inline-block">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  );
}

import React from 'react';
import { Calendar as CalendarIcon, Clock, BookOpen, FlaskConical, Calculator, Palette } from 'lucide-react';

const ASSIGNMENTS = [
  {
    id: 1,
    title: 'Algebra Worksheet',
    subject: 'Math',
    day: 'Monday',
    date: 'Oct 12',
    time: '11:59 PM',
    icon: <Calculator size={18} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    iconColor: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Cell Structure Model',
    subject: 'Science',
    day: 'Wednesday',
    date: 'Oct 14',
    time: '09:00 AM',
    icon: <FlaskConical size={18} />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconColor: 'bg-emerald-500',
  },
  {
    id: 3,
    title: 'Read Chapter 4-5',
    subject: 'Literature',
    day: 'Thursday',
    date: 'Oct 15',
    time: '10:00 AM',
    icon: <BookOpen size={18} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    iconColor: 'bg-purple-500',
  },
  {
    id: 4,
    title: 'Art History Essay',
    subject: 'Art',
    day: 'Friday',
    date: 'Oct 16',
    time: '05:00 PM',
    icon: <Palette size={18} />,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    iconColor: 'bg-rose-500',
  }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentCalendar() {
  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600 rotate-3">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Your Upcoming Due Dates ✨</h2>
          <p className="text-sm text-slate-500 font-medium">Keep track of your magical learning journey!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const dayAssignments = ASSIGNMENTS.filter(a => a.day === day);
          const isToday = day === 'Wednesday'; // Mocking today

          return (
            <div key={day} className={`flex flex-col rounded-2xl p-3 ${isToday ? 'bg-slate-50 ring-2 ring-emerald-200/50' : ''}`}>
              <div className="text-center mb-4">
                <div className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {day}
                </div>
                {isToday && <div className="text-[10px] font-bold text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">TODAY</div>}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {dayAssignments.length === 0 ? (
                  <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-300 text-sm font-medium">
                    No homework! 🎉
                  </div>
                ) : (
                  dayAssignments.map(assignment => (
                    <div 
                      key={assignment.id} 
                      className={`relative p-4 rounded-2xl border ${assignment.color} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
                    >
                      <div className={`absolute -top-3 -right-2 text-white p-1.5 rounded-xl shadow-sm transform group-hover:rotate-12 transition-transform ${assignment.iconColor}`}>
                        {assignment.icon}
                      </div>
                      <div className="text-xs font-bold opacity-70 mb-1">{assignment.subject}</div>
                      <div className="font-bold leading-tight mb-3 pr-4">{assignment.title}</div>
                      <div className="flex items-center gap-1.5 text-xs font-bold opacity-75">
                        <Clock size={12} /> {assignment.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


import React from 'react';
import { Language, Translation } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang, activeTab, setActiveTab }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-emerald-800">
          <h1 className="text-xl font-bold tracking-tight">{t.schoolName}</h1>
          <p className="text-xs text-emerald-300 mt-1 uppercase">Management System</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: t.dashboard, icon: '📊' },
            { id: 'students', label: t.students, icon: '🎓' },
            { id: 'attendance', label: t.attendance, icon: '✅' },
            { id: 'results', label: t.results, icon: '📝' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-emerald-700 text-white shadow-lg' : 'hover:bg-emerald-800 text-emerald-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-emerald-800 text-xs text-emerald-400 text-center">
          &copy; 2024 Amar Shikkhaloy
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden">
             <h1 className="font-bold text-emerald-900">{t.schoolName}</h1>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === 'bn' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

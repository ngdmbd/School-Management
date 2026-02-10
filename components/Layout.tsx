
import React from 'react';
import { Language, Translation } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang, activeTab, setActiveTab, onLogout, userName }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter',_'Hind_Siliguri']">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-950 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl">
        <div className="p-8 border-b border-emerald-900/50 bg-emerald-950/50">
          <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Madrasha Management</div>
          <h1 className="text-lg font-bold leading-tight">{t.schoolName}</h1>
        </div>
        
        <nav className="flex-1 p-4 mt-4 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: t.dashboard, icon: '🏠' },
            { id: 'students', label: t.students, icon: '👥' },
            { id: 'attendance', label: t.attendance, icon: '📅' },
            { id: 'results', label: t.results, icon: '📜' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'hover:bg-emerald-900/50 text-emerald-100/70 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-emerald-950/80 border-t border-emerald-900/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl text-red-300 hover:bg-red-950 hover:text-red-100 transition-all duration-300"
          >
            <span>🚪</span>
            <span className="font-bold text-sm">{t.logout}</span>
          </button>
          <div className="mt-4 text-[10px] text-emerald-600 text-center font-medium">
            &copy; 2024 Nagarganj Shikkha System
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="md:hidden">
             <h1 className="font-black text-emerald-900 tracking-tight">{t.schoolName}</h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{activeTab} View</h2>
          </div>
          
          <div className="flex items-center space-x-6 ml-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lang === 'en' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  lang === 'bn' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">{userName}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Super Admin</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black shadow-lg border-2 border-white">
                {userName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

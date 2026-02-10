
import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: '🏠' },
    { id: 'students', label: t.students, icon: '👥' },
    { id: 'attendance', label: t.attendance, icon: '📅' },
    { id: 'results', label: t.results, icon: '📜' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter',_'Hind_Siliguri']">
      
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-emerald-950 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 border-b border-emerald-900/50 bg-emerald-950/50 flex justify-between items-center">
          <div>
            <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Madrasha Management</div>
            <h1 className="text-lg font-bold leading-tight">{t.schoolName}</h1>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-2xl text-emerald-400 p-2">&times;</button>
        </div>
        
        <nav className="flex-1 p-4 mt-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                  : 'hover:bg-emerald-900/50 text-emerald-100/70 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-emerald-950/80 border-t border-emerald-900/50">
          <button 
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl text-red-300 hover:bg-red-950 hover:text-red-100 transition-all duration-300"
          >
            <span>🚪</span>
            <span className="font-bold text-sm">{t.logout}</span>
          </button>
          <div className="mt-4 text-[10px] text-emerald-700 text-center font-black uppercase tracking-widest">
            &copy; 2024 Nagarganj Shikkha System
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 shadow-sm">
          
          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden mr-4 p-2.5 bg-slate-100 rounded-xl text-emerald-900 hover:bg-emerald-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <div className="md:hidden">
               <h1 className="font-black text-emerald-900 text-sm tracking-tight leading-none truncate max-w-[150px]">{t.schoolName}</h1>
            </div>
            <div className="hidden md:block">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">{activeTab} View</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Language Switcher - compact on mobile */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setLang('en')}
                className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-black rounded-lg transition-all ${
                  lang === 'en' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-black rounded-lg transition-all ${
                  lang === 'bn' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>
            
            <div className="flex items-center space-x-3 pl-3 md:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">{userName}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Admin</p>
              </div>
              <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black shadow-lg border-2 border-white text-sm md:text-base">
                {userName?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

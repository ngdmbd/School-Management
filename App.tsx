
import React, { useState, useEffect } from 'react';
import { Language, Student, User } from './types';
import { TRANSLATIONS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import Auth from './components/Auth';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[lang];

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('app_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    fetchStudents();
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_session');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth lang={lang} setLang={setLang} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <Dashboard students={students} t={t} />
        )}
        
        {activeTab === 'students' && (
          <StudentManagement 
            students={students} 
            refreshData={fetchStudents}
            t={t} 
            lang={lang} 
          />
        )}

        {(activeTab === 'attendance' || activeTab === 'results') && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <span className="text-4xl mb-4">🚧</span>
            <p className="text-lg font-medium">{lang === 'bn' ? 'নির্মাণাধীন...' : 'Module Under Construction'}</p>
            <p className="text-sm">{lang === 'bn' ? 'পরবর্তী আপডেটে এটি যুক্ত করা হবে।' : 'Coming soon in the next update.'}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 md:hidden">
         <button 
           onClick={handleLogout}
           className="bg-red-500 text-white p-3 rounded-full shadow-lg"
         >
           🚪
         </button>
      </div>
    </Layout>
  );
};

export default App;

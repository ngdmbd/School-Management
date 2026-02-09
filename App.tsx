
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
    // 1. Check for existing Supabase session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Try to fetch profile for more details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setUser({
          id: session.user.id,
          name: profile?.name || 'User',
          mobile: profile?.mobile || '',
          email: session.user.email
        });
        fetchStudents();
      }
      setLoading(false);
    };

    checkUser();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStudents([]);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            name: profile?.name || 'User',
            mobile: profile?.mobile || '',
            email: session.user.email
          });
          fetchStudents();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    fetchStudents();
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('app_session');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        <p className="text-emerald-700 font-medium animate-pulse">
          {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Loading...'}
        </p>
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
      onLogout={handleLogout}
      userName={user.name}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="text-5xl mb-4">🏗️</span>
            <p className="text-lg font-bold text-slate-600">{lang === 'bn' ? 'মডিউলটি তৈরি করা হচ্ছে' : 'Module Under Construction'}</p>
            <p className="text-sm mt-1">{lang === 'bn' ? 'খুব শীঘ্রই এটি আপডেট করা হবে।' : 'Coming soon in the next update.'}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 md:hidden">
         <button 
           onClick={handleLogout}
           title={t.logout}
           className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl transform active:scale-90 transition-all"
         >
           🚪
         </button>
      </div>
    </Layout>
  );
};

export default App;


import React, { useState, useEffect, useRef } from 'react';
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
  const [errorOccurred, setErrorOccurred] = useState(false);
  
  // Fix: Cannot find namespace 'NodeJS'. Using ReturnType<typeof setTimeout> is safer for cross-environment browser/node execution.
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[lang];

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setStudents(data || []);
      } else {
        console.warn('Student fetch error (ignore if table is empty):', error.message);
      }
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  const initializeUser = async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error) console.warn('Profile fetch error:', error.message);

      setUser({
        id: sessionUser.id,
        name: profile?.name || 'Admin',
        mobile: profile?.mobile || '',
        email: sessionUser.email
      });
      fetchStudents();
    } catch (err) {
      console.error('Initialization Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Safety timeout: If loading takes too long, force stop it
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn('Loading took too long, forcing entry...');
        setLoading(false);
        setErrorOccurred(true);
      }
    }, 6000);

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await initializeUser(session.user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Session Check Error:', err);
        setLoading(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStudents([]);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        await initializeUser(session.user);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Do nothing special, just ensure loading is handled
      }
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    fetchStudents();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-50 flex-col space-y-6 p-4 text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 border-opacity-20 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">🕌</div>
        </div>
        <div>
          <p className="text-emerald-900 font-black text-xl mb-2">
            {lang === 'bn' ? 'নাগরগঞ্জ মাদ্রাসা' : 'Nagarganj Madrasha'}
          </p>
          <p className="text-emerald-700/60 font-bold animate-pulse">
            {lang === 'bn' ? 'লোড হচ্ছে, দয়া করে অপেক্ষা করুন...' : 'Initializing system, please wait...'}
          </p>
        </div>
        
        {errorOccurred && (
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all shadow-sm"
          >
            {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Try Again'}
          </button>
        )}
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
      <div className="animate-in fade-in duration-700">
        {activeTab === 'dashboard' && <Dashboard students={students} t={t} />}
        {activeTab === 'students' && (
          <StudentManagement 
            students={students} 
            refreshData={fetchStudents}
            t={t} 
            lang={lang} 
          />
        )}
        {(activeTab === 'attendance' || activeTab === 'results') && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-emerald-100 shadow-inner">
            <span className="text-6xl mb-6">🛠️</span>
            <p className="text-2xl font-black text-emerald-900">{lang === 'bn' ? 'মডিউলটি প্রক্রিয়াধীন' : 'Module Under Development'}</p>
            <p className="text-slate-500 font-bold mt-2">{lang === 'bn' ? 'খুব শীঘ্রই এই ফিচারটি যুক্ত করা হবে।' : 'This feature will be available soon.'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

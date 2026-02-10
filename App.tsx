
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
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setStudents(data || []);
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            name: profile?.name || 'Admin',
            mobile: profile?.mobile || '',
            email: session.user.email
          });
          fetchStudents();
        }
      } catch (err) {
        console.error('Init Auth Error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setStudents([]);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setUser({
          id: session.user.id,
          name: profile?.name || 'Admin',
          mobile: profile?.mobile || '',
          email: session.user.email
        });
        fetchStudents();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
      // Fallback in case signOut fails
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-50 flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600 border-opacity-20 border-t-emerald-600"></div>
        <p className="text-emerald-800 font-bold animate-pulse text-lg">
          {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading Nagarganj Madrasha...'}
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
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-3xl border border-dashed border-emerald-200">
            <span className="text-6xl mb-4">🕌</span>
            <p className="text-xl font-bold text-emerald-900">{lang === 'bn' ? 'মডিউলটি প্রক্রিয়াধীন' : 'Module Under Development'}</p>
            <p className="text-sm mt-2">{lang === 'bn' ? 'খুব শীঘ্রই এই ফিচারটি যুক্ত করা হবে।' : 'This feature will be available soon.'}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

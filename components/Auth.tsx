
import React, { useState } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../supabase';

interface AuthProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ lang, setLang, onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    identifier: '', // Email or Mobile
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = TRANSLATIONS[lang];

  // Simple check to see if string is an email
  const isEmail = (str: string) => /\S+@\S+\.\S+/.test(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        if (!formData.identifier || !formData.password) {
          setError(lang === 'bn' ? 'সবগুলো ঘর পূরণ করুন' : 'Please fill all fields');
          setIsLoading(false);
          return;
        }

        let loginEmail = formData.identifier;

        // If identifier is a mobile number, lookup the associated email first
        if (!isEmail(formData.identifier)) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('mobile', formData.identifier)
            .maybeSingle();

          if (profileError || !profile) {
            setError(lang === 'bn' ? 'এই মোবাইল নম্বরটি নিবন্ধিত নয়' : 'Mobile number not found');
            setIsLoading(false);
            return;
          }
          loginEmail = profile.email;
        }

        // Supabase Auth Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: formData.password,
        });

        if (authError) {
          setError(lang === 'bn' ? 'ভুল তথ্য বা পাসওয়ার্ড' : authError.message);
        } else if (authData.user) {
          // Fetch full profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          onLogin({ 
            id: authData.user.id, 
            name: profile?.name || 'User', 
            mobile: profile?.mobile || '', 
            email: authData.user.email 
          });
        }
      } else {
        // Registration Logic
        if (!formData.name || !formData.mobile || !formData.email || !formData.password) {
          setError(lang === 'bn' ? 'সবগুলো ঘর পূরণ করুন' : 'Please fill all fields');
          setIsLoading(false);
          return;
        }

        // 1. Supabase Auth Sign Up
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // 2. Insert into profiles table to store mobile and name
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: authData.user.id,
              name: formData.name, 
              mobile: formData.mobile, 
              email: formData.email
            }]);

          if (profileError) {
            console.error('Profile Creation Error:', profileError);
            // If profile fails, user is still in Auth, but we show error
            setError(lang === 'bn' ? 'প্রোফাইল তৈরি করা সম্ভব হয়নি' : 'Failed to create profile record');
          } else {
            onLogin({ 
              id: authData.user.id, 
              name: formData.name, 
              mobile: formData.mobile, 
              email: formData.email 
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Auth Full Error:', err);
      setError(lang === 'bn' ? (err.message || 'সার্ভারে সমস্যা হয়েছে') : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <style>{`
        input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-emerald-900">{t.schoolName}</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLang('bn')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'bn' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>বাংলা</button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">{isLoginView ? t.welcomeBack : t.createNewAccount}</h2>
            <p className="text-slate-500 text-sm mt-1">{isLoginView ? (lang === 'bn' ? 'সিস্টেমে প্রবেশ করুন' : 'Login to your account') : (lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Join our system')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLoginView ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.emailOrMobile}</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white text-slate-900" 
                  value={formData.identifier} 
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})} 
                  placeholder="email@example.com / 017..."
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.mobileNumber}</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900" 
                    value={formData.mobile} 
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})} 
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white text-slate-900" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 transform active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...'}
                </div>
              ) : (isLoginView ? t.login : t.register)}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(''); }} 
              className="text-emerald-700 font-semibold text-sm hover:text-emerald-800"
            >
              {isLoginView ? t.noAccount : t.haveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;


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
    identifier: '', // Can be email or mobile for login
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = TRANSLATIONS[lang];

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

        // Search for user with either mobile OR email matching the identifier
        const { data, error: dbError } = await supabase
          .from('app_users')
          .select('*')
          .or(`mobile.eq."${formData.identifier}",email.eq."${formData.identifier}"`)
          .eq('password', formData.password)
          .maybeSingle();

        if (dbError || !data) {
          setError(lang === 'bn' ? 'ভুল মোবাইল/ইমেইল বা পাসওয়ার্ড' : 'Invalid identifier or password');
        } else {
          onLogin({ id: data.id, name: data.name, mobile: data.mobile, email: data.email });
        }
      } else {
        if (!formData.name || !formData.mobile || !formData.email || !formData.password) {
          setError(lang === 'bn' ? 'সবগুলো ঘর পূরণ করুন' : 'Please fill all fields');
          setIsLoading(false);
          return;
        }

        // Check if mobile or email already exists
        const { data: existingUser } = await supabase
          .from('app_users')
          .select('id')
          .or(`mobile.eq."${formData.mobile}",email.eq."${formData.email}"`)
          .maybeSingle();

        if (existingUser) {
          setError(lang === 'bn' ? 'এই নম্বর বা ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' : 'Account already exists with this mobile or email');
          setIsLoading(false);
          return;
        }

        const { data, error: insertError } = await supabase
          .from('app_users')
          .insert([{ 
            name: formData.name, 
            mobile: formData.mobile, 
            email: formData.email,
            password: formData.password 
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        onLogin({ id: data.id, name: data.name, mobile: data.mobile, email: data.email });
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(lang === 'bn' ? 'সার্ভারে সমস্যা হয়েছে' : 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-emerald-900">{t.schoolName}</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLang('bn')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lang === 'bn' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>বাংলা</button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800">{isLoginView ? t.welcomeBack : t.createNewAccount}</h2>
            <p className="text-slate-500 text-sm mt-1">{isLoginView ? (lang === 'bn' ? 'প্রবেশ করুন' : 'Access account') : (lang === 'bn' ? 'নিবন্ধন করুন' : 'Sign up')}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLoginView ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.emailOrMobile}</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={formData.identifier} 
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})} 
                  placeholder={lang === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.fullName}</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                  <input type="email" placeholder="example@mail.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.mobileNumber}</label>
                  <input type="tel" placeholder="017XXXXXXXX" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 transform active:scale-[0.98]">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Please wait...'}
                </div>
              ) : (isLoginView ? t.login : t.register)}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-emerald-700 font-semibold text-sm hover:underline">
              {isLoginView ? t.noAccount : t.haveAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

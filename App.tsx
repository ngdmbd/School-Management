
import React, { useState } from 'react';
import { Language, Student } from './types';
import { TRANSLATIONS, MOCK_STUDENTS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const t = TRANSLATIONS[lang];

  return (
    <Layout lang={lang} setLang={setLang} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <Dashboard students={students} t={t} />
        )}
        
        {activeTab === 'students' && (
          <StudentManagement 
            students={students} 
            setStudents={setStudents} 
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
    </Layout>
  );
};

export default App;

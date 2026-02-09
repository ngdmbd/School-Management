
import React, { useState } from 'react';
import { Student, Translation, Language } from '../types';
import { CLASSES_SCHOOL, CLASSES_MADRASA } from '../constants';
import { getStudentPerformanceInsight } from '../services/geminiService';
import { supabase } from '../supabase';

interface StudentManagementProps {
  students: Student[];
  refreshData: () => Promise<void>;
  t: Translation;
  lang: Language;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, refreshData, t, lang }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [aiInsight, setAiInsight] = useState<{id: string, text: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState: Omit<Student, 'id'> = {
    name: '',
    roll: '',
    class: CLASSES_SCHOOL[0],
    section: 'A',
    gender: 'Male',
    institutionType: 'school',
    grade: 'A+',
    attendance: 100,
    contact: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll.includes(search)
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', editingStudent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .insert([formData]);
        if (error) throw error;
      }
      await refreshData();
      closeForm();
    } catch (err) {
      console.error('Save Error:', err);
      alert(lang === 'bn' ? 'সংরক্ষণ করা সম্ভব হয়নি' : 'Failed to save student');
    } finally {
      setIsSaving(false);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setFormData(initialFormState);
  };

  const handleEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData(s);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert(lang === 'bn' ? 'মুছে ফেলা সম্ভব হয়নি' : 'Failed to delete');
      } else {
        await refreshData();
      }
    }
  };

  const handleAiInsight = async (student: Student) => {
    setLoadingAi(student.id);
    const insight = await getStudentPerformanceInsight(student, lang);
    setAiInsight({ id: student.id, text: insight || '' });
    setLoadingAi(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">{t.students}</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'}
            className="flex-1 sm:w-64 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            {t.addStudent}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t.rollNo}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t.studentName}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t.class}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{t.grade}</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <React.Fragment key={student.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.roll}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.section} • {student.gender}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.class}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">{student.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleAiInsight(student)} className="text-emerald-600 text-xs underline font-bold">{loadingAi === student.id ? '...' : t.askAi}</button>
                      <button onClick={() => handleEdit(student)} className="text-slate-400 hover:text-emerald-600">✏️</button>
                      <button onClick={() => handleDelete(student.id)} className="text-slate-400 hover:text-red-600">🗑️</button>
                    </td>
                  </tr>
                  {aiInsight?.id === student.id && (
                    <tr className="bg-emerald-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="text-xs font-bold text-emerald-800 uppercase mb-1">{t.aiInsights}</div>
                        <p className="text-sm text-emerald-900 italic">"{aiInsight.text}"</p>
                        <button onClick={() => setAiInsight(null)} className="text-xs text-emerald-600 font-bold mt-2">Dismiss</button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">{lang === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No students found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingStudent ? t.edit : t.addStudent}</h3>
              <button onClick={closeForm} className="text-slate-400 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.institutionType}</label>
                <div className="flex space-x-2">
                  <button onClick={() => setFormData({...formData, institutionType: 'school', class: CLASSES_SCHOOL[0]})} className={`flex-1 py-2 rounded-lg border ${formData.institutionType === 'school' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200'}`}>{t.schoolOption}</button>
                  <button onClick={() => setFormData({...formData, institutionType: 'madrasa', class: CLASSES_MADRASA[0]})} className={`flex-1 py-2 rounded-lg border ${formData.institutionType === 'madrasa' ? 'bg-emerald-50 border-emerald-500' : 'border-slate-200'}`}>{t.madrasaOption}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-medium">{t.studentName}</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className="text-sm font-medium">{t.rollNo}</label><input type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} /></div>
                <div><label className="text-sm font-medium">{t.class}</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>
                    {(formData.institutionType === 'school' ? CLASSES_SCHOOL : CLASSES_MADRASA).map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex space-x-3">
              <button onClick={closeForm} className="flex-1 px-4 py-2 border rounded-lg">{t.cancel}</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">{isSaving ? '...' : t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

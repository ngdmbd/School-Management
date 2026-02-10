
import React, { useState } from 'react';
import { Student, Translation, Language } from '../types';
import { CLASSES_MADRASA } from '../constants';
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
    name_en: '',
    name_bn: '',
    roll: '',
    class: CLASSES_MADRASA[0],
    section: 'A',
    gender: 'Male',
    dob: '',
    birth_id: '',
    father_name_en: '',
    father_name_bn: '',
    father_id: '',
    mother_name_en: '',
    address_bn: '',
    contact: '',
    grade: 'A+',
    attendance: 100
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredStudents = students.filter(s => 
    s.name_en?.toLowerCase().includes(search.toLowerCase()) || 
    s.name_bn?.includes(search) ||
    s.roll?.includes(search)
  );

  const handleSave = async () => {
    if (!formData.name_en || !formData.name_bn || !formData.roll) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে নাম এবং রোল নম্বর লিখুন' : 'Please fill Name and Roll Number');
      return;
    }

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
      alert(lang === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে' : 'Saved successfully');
    } catch (err: any) {
      console.error('Save Error:', err);
      alert(lang === 'bn' ? `সেভ করা যায়নি: ${err.message}` : `Failed to save: ${err.message}`);
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
    setFormData({
      name_en: s.name_en || '',
      name_bn: s.name_bn || '',
      roll: s.roll || '',
      class: s.class || CLASSES_MADRASA[0],
      section: s.section || 'A',
      gender: s.gender || 'Male',
      dob: s.dob || '',
      birth_id: s.birth_id || '',
      father_name_en: s.father_name_en || '',
      father_name_bn: s.father_name_bn || '',
      father_id: s.father_id || '',
      mother_name_en: s.mother_name_en || '',
      address_bn: s.address_bn || '',
      contact: s.contact || '',
      grade: s.grade || 'A+',
      attendance: s.attendance || 100
    });
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

  const inputClass = "w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-medium transition-all shadow-sm";
  const labelClass = "block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">{t.students}</h2>
        <div className="flex w-full sm:w-auto space-x-2">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'খুঁজুন (নাম বা রোল)...' : 'Search (Name or Roll)...'}
            className="flex-1 sm:w-64 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setIsFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95">
            {t.addStudent}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.rollNo}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.class}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.contact}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <React.Fragment key={student.id}>
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{student.roll}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{lang === 'bn' ? student.name_bn : student.name_en}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.name_en}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{student.class} ({student.section})</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{student.contact || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleAiInsight(student)} className="text-emerald-600 text-xs font-bold hover:underline">{loadingAi === student.id ? '...' : t.askAi}</button>
                      <button onClick={() => handleEdit(student)} className="text-slate-400 hover:text-emerald-600 transition-colors">✏️</button>
                      <button onClick={() => handleDelete(student.id)} className="text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
                    </td>
                  </tr>
                  {aiInsight?.id === student.id && (
                    <tr className="bg-emerald-50">
                      <td colSpan={5} className="px-6 py-5">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">✨</span>
                          <div>
                            <div className="text-xs font-black text-emerald-800 uppercase mb-1 tracking-widest">{t.aiInsights}</div>
                            <p className="text-sm text-emerald-900 leading-relaxed font-medium italic">"{aiInsight.text}"</p>
                            <button onClick={() => setAiInsight(null)} className="text-[10px] font-black text-emerald-600 uppercase mt-2 tracking-tighter hover:text-emerald-800">Close Analysis</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">{lang === 'bn' ? 'কোন শিক্ষার্থী পাওয়া যায়নি' : 'No students found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl my-8 overflow-hidden border border-emerald-100 transform animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-900 text-white">
              <div>
                <h3 className="text-xl font-black tracking-tight">{editingStudent ? (lang === 'bn' ? 'তথ্য সংশোধন' : 'Edit Information') : t.addStudent}</h3>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mt-1">Nagarganj Dakhil Madrasha</p>
              </div>
              <button onClick={closeForm} className="h-10 w-10 rounded-full flex items-center justify-center text-white text-3xl hover:bg-emerald-800 transition-all">&times;</button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white">
              {/* Basic Info Section */}
              <div className="space-y-5">
                <div className="flex items-center space-x-2 text-emerald-800 font-black text-sm uppercase tracking-wider border-b pb-2 border-emerald-50">
                   <span>📌</span> <span>{lang === 'bn' ? 'প্রাথমিক তথ্য' : 'Basic Information'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'নাম (ইংরেজিতে) *' : 'Name (English) *'}</label>
                    <input type="text" className={inputClass} value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} placeholder="Full name in English" />
                  </div>
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'নাম (বাংলায়) *' : 'Name (Bangla) *'}</label>
                    <input type="text" className={inputClass} value={formData.name_bn} onChange={e => setFormData({...formData, name_bn: e.target.value})} placeholder="বাংলায় পূর্ণ নাম" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</label>
                    <input type="date" className={inputClass} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'জন্ম নিবন্ধন নম্বর' : 'Birth ID'}</label>
                    <input type="text" className={inputClass} value={formData.birth_id} onChange={e => setFormData({...formData, birth_id: e.target.value})} placeholder="17 Digit ID" />
                  </div>
                  <div>
                    <label className={labelClass}>{t.rollNo} *</label>
                    <input type="text" className={inputClass} value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} placeholder="Roll No" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>{t.class}</label>
                    <select className={inputClass} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>
                      {CLASSES_MADRASA.map(c => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{t.section}</label>
                    <input type="text" className={inputClass} value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>{t.gender}</label>
                    <select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                      <option value="Male">{lang === 'bn' ? 'ছাত্র' : 'Male'}</option>
                      <option value="Female">{lang === 'bn' ? 'ছাত্রী' : 'Female'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Father Section */}
              <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center space-x-2 text-blue-800 font-black text-sm uppercase tracking-wider border-b pb-2 border-blue-50">
                   <span>👨‍💼</span> <span>{lang === 'bn' ? 'পিতার তথ্য' : "Father's Information"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'পিতার নাম (ইংরেজিতে)' : "Father's Name (EN)"}</label>
                    <input type="text" className={inputClass} value={formData.father_name_en} onChange={e => setFormData({...formData, father_name_en: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'পিতার নাম (বাংলায়)' : "Father's Name (BN)"}</label>
                    <input type="text" className={inputClass} value={formData.father_name_bn} onChange={e => setFormData({...formData, father_name_bn: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>{lang === 'bn' ? 'পিতার আইডি (NID)' : "Father's ID"}</label>
                    <input type="text" className={inputClass} value={formData.father_id} onChange={e => setFormData({...formData, father_id: e.target.value})} placeholder="NID or Smart Card ID" />
                  </div>
                </div>
              </div>

              {/* Mother & Contact Section */}
              <div className="space-y-5">
                <div className="flex items-center space-x-2 text-rose-800 font-black text-sm uppercase tracking-wider border-b pb-2 border-rose-50">
                   <span>👩‍💼</span> <span>{lang === 'bn' ? 'মাতা ও যোগাযোগ' : "Mother & Contact"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>{lang === 'bn' ? 'মাতার নাম (ইংরেজিতে)' : "Mother's Name (EN)"}</label>
                    <input type="text" className={inputClass} value={formData.mother_name_en} onChange={e => setFormData({...formData, mother_name_en: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>{t.contact} *</label>
                    <input type="tel" className={inputClass} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="017xxxxxxxx" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{lang === 'bn' ? 'বর্তমান ও স্থায়ী ঠিকানা (বাংলায়)' : 'Address (Bangla)'}</label>
                  <textarea rows={2} className={inputClass} value={formData.address_bn} onChange={e => setFormData({...formData, address_bn: e.target.value})} placeholder="গ্রাম, ডাকঘর, থানা, জেলা..." />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex space-x-4">
              <button onClick={closeForm} className="flex-1 px-4 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-white hover:text-slate-800 transition-all uppercase tracking-widest text-xs">{t.cancel}</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center uppercase tracking-widest text-xs">
                {isSaving ? (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                ) : null}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

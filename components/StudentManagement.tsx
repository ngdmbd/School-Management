
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
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

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name_en?.toLowerCase().includes(search.toLowerCase()) || 
                         s.name_bn?.includes(search) ||
                         s.roll?.includes(search);
    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      alert(lang === 'bn' ? 'ডাউনলোড করার জন্য কোন তথ্য নেই' : 'No data to export');
      return;
    }

    const headers = [
      'Roll', 'Name (English)', 'Name (Bangla)', 'Class', 'Section', 'Gender', 
      'Date of Birth', 'Birth ID', 'Father (EN)', 'Father (BN)', 'Father NID', 
      'Mother (EN)', 'Contact', 'Address (BN)', 'Grade', 'Attendance'
    ];

    const rows = filteredStudents.map(s => [
      s.roll, s.name_en, s.name_bn, s.class, s.section, s.gender,
      s.dob, s.birth_id, s.father_name_en, s.father_name_bn, s.father_id,
      s.mother_name_en, s.contact, s.address_bn, s.grade, s.attendance
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Student_Details_Full_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleSave = async () => {
    if (!formData.name_en || !formData.name_bn || !formData.roll) {
      alert(lang === 'bn' ? 'নাম এবং রোল নম্বর অবশ্যই দিতে হবে' : 'Name and Roll Number are required');
      return;
    }

    setIsSaving(true);
    const dataToSave = { ...formData };
    Object.keys(dataToSave).forEach(key => {
      if ((dataToSave as any)[key] === "") (dataToSave as any)[key] = null;
    });

    try {
      if (editingStudent) {
        const { error } = await supabase.from('students').update(dataToSave).eq('id', editingStudent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('students').insert([dataToSave]);
        if (error) throw error;
      }
      await refreshData();
      closeForm();
      alert(lang === 'bn' ? 'সফলভাবে সেভ করা হয়েছে!' : 'Saved successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    setFormData({ ...s });
    setIsFormOpen(true);
  };

  const handleView = (s: Student) => {
    setViewingStudent(s);
    setIsViewOpen(true);
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-black font-bold transition-all shadow-sm";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1 tracking-widest";

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নাম বা রোল দিয়ে খুঁজুন...' : 'Search by Name or Roll...'}
            className="w-full sm:w-80 px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="All">{lang === 'bn' ? 'সব শ্রেণী' : 'All Classes'}</option>
            {CLASSES_MADRASA.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button onClick={handleExport} className="flex-1 lg:flex-none px-6 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            📊 {lang === 'bn' ? 'এক্সেল' : 'Excel'}
          </button>
          <button onClick={() => setIsFormOpen(true)} className="flex-1 lg:flex-none px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
            + {t.addStudent}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-emerald-50/20 transition-all group">
                  <td className="px-6 py-4 font-black text-emerald-900">{s.roll}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{lang === 'bn' ? s.name_bn : s.name_en}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{s.name_en}</div>
                  </td>
                  <td className="px-6 py-4"><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">{s.class}</span></td>
                  <td className="px-6 py-4 text-slate-500 font-bold text-sm">{s.contact || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <button onClick={() => handleView(s)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="View">👁️</button>
                    <button onClick={() => handleEdit(s)} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Edit">✏️</button>
                    <button onClick={async () => { if(confirm('Are you sure?')) await supabase.from('students').delete().eq('id', s.id); refreshData(); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewOpen && viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-emerald-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">{lang === 'bn' ? 'শিক্ষার্থীর পূর্ণাঙ্গ তথ্য' : 'Student Full Profile'}</h3>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">Nagarganj Dakhil Madrasha</p>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-3xl">&times;</button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
               <DetailItem label="Full Name (EN)" value={viewingStudent.name_en} />
               <DetailItem label="Full Name (BN)" value={viewingStudent.name_bn} />
               <DetailItem label="Roll Number" value={viewingStudent.roll} />
               <DetailItem label="Class & Section" value={`${viewingStudent.class} (${viewingStudent.section})`} />
               <DetailItem label="Date of Birth" value={viewingStudent.dob} />
               <DetailItem label="Birth ID Number" value={viewingStudent.birth_id} />
               <DetailItem label="Father's Name (EN)" value={viewingStudent.father_name_en} />
               <DetailItem label="Father's Name (BN)" value={viewingStudent.father_name_bn} />
               <DetailItem label="Father's ID (NID)" value={viewingStudent.father_id} />
               <DetailItem label="Mother's Name (EN)" value={viewingStudent.mother_name_en} />
               <DetailItem label="Contact Number" value={viewingStudent.contact} />
               <div className="md:col-span-2">
                 <DetailItem label="Address (BN)" value={viewingStudent.address_bn} />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl my-8 overflow-hidden shadow-2xl border-4 border-white animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8 bg-emerald-900 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingStudent ? (lang === 'bn' ? 'তথ্য সংশোধন' : 'Edit Student') : t.addStudent}</h3>
              <button onClick={closeForm} className="text-4xl hover:rotate-90 transition-all">&times;</button>
            </div>
            
            <div className="p-10 space-y-10 max-h-[75vh] overflow-y-auto bg-white custom-scrollbar">
              {/* Section 1: Basic */}
              <div className="space-y-6">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] border-b-2 border-emerald-50 pb-2 flex items-center gap-2">
                  <span className="text-lg">🆔</span> {lang === 'bn' ? 'প্রাথমিক তথ্য' : 'Basic Identity'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClass}>Name (English) *</label><input className={inputClass} value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} /></div>
                  <div><label className={labelClass}>নাম (বাংলায়) *</label><input className={inputClass} value={formData.name_bn} onChange={e => setFormData({...formData, name_bn: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className={labelClass}>Date of Birth</label><input type="date" className={inputClass} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                  <div><label className={labelClass}>Birth ID Number</label><input className={inputClass} value={formData.birth_id} onChange={e => setFormData({...formData, birth_id: e.target.value})} placeholder="17 Digit Number" /></div>
                  <div><label className={labelClass}>Roll Number *</label><input className={inputClass} value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className={labelClass}>Class</label><select className={inputClass} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})}>{CLASSES_MADRASA.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className={labelClass}>Section</label><input className={inputClass} value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} /></div>
                  <div><label className={labelClass}>Gender</label><select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                </div>
              </div>

              {/* Section 2: Parents */}
              <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] border-b-2 border-blue-100 pb-2 flex items-center gap-2">
                  <span className="text-lg">👨‍👩‍👦</span> {lang === 'bn' ? 'অভিভাবকের তথ্য' : 'Parents Info'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClass}>Father's Name (EN)</label><input className={inputClass} value={formData.father_name_en} onChange={e => setFormData({...formData, father_name_en: e.target.value})} /></div>
                  <div><label className={labelClass}>পিতার নাম (বাংলায়)</label><input className={inputClass} value={formData.father_name_bn} onChange={e => setFormData({...formData, father_name_bn: e.target.value})} /></div>
                  <div><label className={labelClass}>Father's ID (NID)</label><input className={inputClass} value={formData.father_id} onChange={e => setFormData({...formData, father_id: e.target.value})} /></div>
                  <div><label className={labelClass}>Mother's Name (EN)</label><input className={inputClass} value={formData.mother_name_en} onChange={e => setFormData({...formData, mother_name_en: e.target.value})} /></div>
                </div>
              </div>

              {/* Section 3: Contact */}
              <div className="space-y-6">
                <div className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] border-b-2 border-rose-50 pb-2 flex items-center gap-2">
                  <span className="text-lg">📍</span> {lang === 'bn' ? 'যোগাযোগ ও ঠিকানা' : 'Contact & Address'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className={labelClass}>Phone Number *</label><input className={inputClass} value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="017XXXXXXXX" /></div>
                  <div className="md:col-span-1"><label className={labelClass}>ঠিকানা (বাংলায়)</label><textarea rows={2} className={`${inputClass} leading-relaxed py-3`} value={formData.address_bn} onChange={e => setFormData({...formData, address_bn: e.target.value})} placeholder="গ্রাম, ডাকঘর, থানা, জেলা" /></div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex gap-4">
              <button onClick={closeForm} className="flex-1 py-5 border-2 border-slate-200 rounded-2xl font-black text-slate-500 hover:bg-white transition-all">CANCEL</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl flex items-center justify-center gap-3">
                {isSaving ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'SAVE STUDENT')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string, value: any }) => (
  <div className="border-b border-slate-50 pb-3">
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-slate-800 font-bold">{value || '---'}</div>
  </div>
);

export default StudentManagement;

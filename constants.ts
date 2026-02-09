
import { Translation, Student } from './types';

export const TRANSLATIONS: Record<'en' | 'bn', Translation> = {
  en: {
    dashboard: "Dashboard",
    students: "Students",
    attendance: "Attendance",
    results: "Results",
    addStudent: "Add Student",
    studentName: "Student Name",
    rollNo: "Roll No.",
    class: "Class",
    section: "Section",
    gender: "Gender",
    actions: "Actions",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    statsTotalStudents: "Total Students",
    statsPresentToday: "Present Today",
    statsMale: "Male Students",
    statsFemale: "Female Students",
    aiInsights: "AI performance Insights",
    askAi: "Ask AI for Analysis",
    schoolName: "Amar Shikkhaloy",
    madrasaOption: "Madrasa",
    schoolOption: "School",
    institutionType: "Institution Type",
    grade: "Grade",
    contact: "Contact",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    students: "শিক্ষার্থী",
    attendance: "উপস্থিতি",
    results: "ফলাফল",
    addStudent: "নতুন শিক্ষার্থী",
    studentName: "শিক্ষার্থীর নাম",
    rollNo: "রোল নম্বর",
    class: "শ্রেণী",
    section: "শাখা",
    gender: "লিঙ্গ",
    actions: "কাজ",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    edit: "সম্পাদনা",
    delete: "মুছে ফেলুন",
    statsTotalStudents: "মোট শিক্ষার্থী",
    statsPresentToday: "আজকের উপস্থিতি",
    statsMale: "ছাত্র",
    statsFemale: "ছাত্রী",
    aiInsights: "এআই কর্মক্ষমতা অন্তর্দৃষ্টি",
    askAi: "বিশ্লেষণের জন্য এআই ব্যবহার করুন",
    schoolName: "আমার শিক্ষালয়",
    madrasaOption: "মাদ্রাসা",
    schoolOption: "স্কুল",
    institutionType: "প্রতিষ্ঠানের ধরন",
    grade: "গ্রেড",
    contact: "যোগাযোগ",
  }
};

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Rakibul Islam', roll: '01', class: '10', section: 'A', gender: 'Male', institutionType: 'school', grade: 'A+', attendance: 95, contact: '01712345678' },
  { id: '2', name: 'Ayesha Khatun', roll: '02', class: '10', section: 'A', gender: 'Female', institutionType: 'school', grade: 'A', attendance: 88, contact: '01812345678' },
  { id: '3', name: 'Mohammad Abdullah', roll: '05', class: 'Alim 1st Year', section: 'B', gender: 'Male', institutionType: 'madrasa', grade: 'A-', attendance: 70, contact: '01912345678' },
  { id: '4', name: 'Sumaiya Akter', roll: '12', class: 'Dakhil 9', section: 'C', gender: 'Female', institutionType: 'madrasa', grade: 'B', attendance: 82, contact: '01612345678' },
];

export const CLASSES_SCHOOL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export const CLASSES_MADRASA = ['Ibtidai 1', 'Ibtidai 5', 'Dakhil 6', 'Dakhil 10', 'Alim 1st Year', 'Alim 2nd Year', 'Fazil', 'Kamil'];

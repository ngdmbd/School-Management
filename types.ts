
export type Language = 'en' | 'bn';

export interface Translation {
  dashboard: string;
  students: string;
  attendance: string;
  results: string;
  addStudent: string;
  studentName: string;
  rollNo: string;
  class: string;
  section: string;
  gender: string;
  actions: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  statsTotalStudents: string;
  statsPresentToday: string;
  statsMale: string;
  statsFemale: string;
  aiInsights: string;
  askAi: string;
  schoolName: string;
  madrasaOption: string;
  schoolOption: string;
  institutionType: string;
  grade: string;
  contact: string;
}

export type InstitutionType = 'school' | 'madrasa';

export interface Student {
  id: string;
  name: string;
  roll: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  institutionType: InstitutionType;
  grade: string;
  attendance: number; // percentage
  contact: string;
}

export interface AppState {
  language: Language;
  students: Student[];
  institutionType: InstitutionType;
}

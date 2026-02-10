
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
  login: string;
  register: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  emailOrMobile: string;
  password: string;
  logout: string;
  noAccount: string;
  haveAccount: string;
  welcomeBack: string;
  createNewAccount: string;
}

export type InstitutionType = 'school' | 'madrasa';

export interface Student {
  id: string;
  name_en: string;
  name_bn: string;
  roll: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  birth_id: string;
  father_name_en: string;
  father_name_bn: string;
  father_id: string;
  mother_name_en: string;
  address_bn: string;
  contact: string;
  grade: string;
  attendance: number;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
}

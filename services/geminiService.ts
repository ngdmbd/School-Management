
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getStudentPerformanceInsight = async (student: Student, language: 'en' | 'bn') => {
  const prompt = language === 'bn' 
    ? `নিচে দেওয়া শিক্ষার্থী তথ্যের উপর ভিত্তি করে একটি সংক্ষিপ্ত এবং উৎসাহমূলক কর্মক্ষমতা রিপোর্ট তৈরি করুন:
       নাম: ${student.name}, রোল: ${student.roll}, ক্লাস: ${student.class}, গ্রেড: ${student.grade}, উপস্থিতি: ${student.attendance}%। 
       রিপোর্টটি বাংলায় লিখুন এবং শিক্ষার্থীর উন্নতির জন্য কিছু পরামর্শ দিন।`
    : `Generate a brief and encouraging performance insight for the following student:
       Name: ${student.name}, Roll: ${student.roll}, Class: ${student.class}, Grade: ${student.grade}, Attendance: ${student.attendance}%.
       Provide suggestions for improvement in English.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return language === 'bn' ? "দুঃখিত, তথ্য আনতে সমস্যা হয়েছে।" : "Sorry, could not generate insights at this time.";
  }
};

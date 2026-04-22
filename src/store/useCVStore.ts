'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MultilingualField {
  pt: string;
  en: string;
}

export interface Experience {
  id: string;
  company: string;
  position: MultilingualField;
  period: string;
  description: MultilingualField;
}

export interface Education {
  id: string;
  institution: string;
  degree: MultilingualField;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: MultilingualField;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    photo?: string;
    jobTitle: MultilingualField;
  };
  summary: MultilingualField;
  experience: Experience[];
  education: Education[];
  skills: MultilingualField[];
  languages: { name: string; level: MultilingualField }[];
  projects: Project[];
  certifications: Certification[];
  settings: {
    template: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    sectionSpacing: number;
  };
}

interface CVState {
  data: CVData;
  activeLanguage: 'pt' | 'en';
  isConverting: boolean;
  
  // Actions
  setLanguage: (lang: 'pt' | 'en') => void;
  setTemplate: (template: string) => void;
  setAccentColor: (color: string) => void;
  updateSettings: (settings: Partial<CVData['settings']>) => void;
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => void;
  updateSummary: (summary: Partial<MultilingualField>) => void;
  
  // Array Actions
  addExperience: () => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  addEducation: () => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  
  addSkill: (skill: string) => void;
  removeSkill: (index: number) => void;
  
  setConverting: (val: boolean) => void;
  setData: (data: CVData) => void;
}

const initialData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    jobTitle: { pt: '', en: '' },
  },
  summary: { pt: '', en: '' },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  settings: {
    template: 'minimalist',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 1.5,
    sectionSpacing: 25,
  },
};

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      data: initialData,
      activeLanguage: 'pt',
      isConverting: false,

      setLanguage: (lang) => set({ activeLanguage: lang }),
      
      setTemplate: (template) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, template } }
        })),

      setAccentColor: (color) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, accentColor: color } }
        })),

      updateSettings: (settings) =>
        set((state) => ({
          data: { ...state.data, settings: { ...state.data.settings, ...settings } }
        })),

      updatePersonalInfo: (info) => 
        set((state) => ({ 
          data: { ...state.data, personalInfo: { ...state.data.personalInfo, ...info } } 
        })),

      updateSummary: (summary) =>
        set((state) => ({
          data: { ...state.data, summary: { ...state.data.summary, ...summary } }
        })),

      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: Math.random().toString(36).substr(2, 9),
                company: '',
                position: { pt: '', en: '' },
                period: '',
                description: { pt: '', en: '' },
              },
            ],
          },
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((e) => e.id !== id),
          },
        })),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: Math.random().toString(36).substr(2, 9),
                institution: '',
                degree: { pt: '', en: '' },
                year: '',
              },
            ],
          },
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((e) => e.id !== id),
          },
        })),

      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              {
                id: Math.random().toString(36).substr(2, 9),
                name: '',
                link: '',
                description: { pt: '', en: '' },
              },
            ],
          },
        })),

      updateProject: (id, proj) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((p) => p.id !== id),
          },
        })),

      addCertification: () =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: [
              ...state.data.certifications,
              {
                id: Math.random().toString(36).substr(2, 9),
                name: '',
                issuer: '',
                year: '',
              },
            ],
          },
        })),

      updateCertification: (id, cert) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.map((c) => (c.id === id ? { ...c, ...cert } : c)),
          },
        })),

      removeCertification: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.filter((c) => c.id !== id),
          },
        })),

      addSkill: (skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [...state.data.skills, { pt: skill, en: '' }],
          },
        })),

      removeSkill: (index) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((_, i) => i !== index),
          },
        })),

      setConverting: (val) => set({ isConverting: val }),
      setData: (data) => set({ data }),
    }),
    {
      name: 'cv-storage-pro',
      merge: (persistedState: any, currentState) => {
        const mergedData = { ...currentState.data, ...(persistedState?.data || {}) };
        if (!mergedData.settings) mergedData.settings = initialData.settings;
        if (!mergedData.projects) mergedData.projects = [];
        if (!mergedData.certifications) mergedData.certifications = [];
        return { ...currentState, ...persistedState, data: mergedData };
      }
    }
  )
);

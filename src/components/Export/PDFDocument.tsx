'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { CVData } from '@/store/useCVStore';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Inter',
    color: '#1e293b',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 20,
    marginBottom: 25,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  contactItem: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#3b82f6',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
    marginBottom: 10,
  },
  summary: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
  },
  experienceItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  expPosition: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  expPeriod: {
    fontSize: 10,
    color: '#64748b',
  },
  expCompany: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 5,
  },
  expDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
  },
  eduItem: {
    marginBottom: 8,
  },
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  }
});

interface PDFDocumentProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export const CVDocument = ({ data, lang }: PDFDocumentProps) => {
  const t = {
    experience: lang === 'pt' ? 'Experiência Profissional' : 'Professional Experience',
    education: lang === 'pt' ? 'Educação' : 'Education',
    skills: lang === 'pt' ? 'Competências' : 'Skills',
    summary: lang === 'pt' ? 'Resumo' : 'Professional Summary',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.fullName || 'Seu Nome'}</Text>
          <Text style={styles.title}>{data.personalInfo.jobTitle[lang] || 'Título Profissional'}</Text>
          <View style={styles.contactGrid}>
            {data.personalInfo.email && <Text style={styles.contactItem}>{data.personalInfo.email}</Text>}
            {data.personalInfo.phone && <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>}
            {data.personalInfo.location && <Text style={styles.contactItem}>{data.personalInfo.location}</Text>}
            {data.personalInfo.linkedin && <Text style={styles.contactItem}>{data.personalInfo.linkedin}</Text>}
          </View>
        </View>

        {data.summary[lang] && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.summary}</Text>
            <Text style={styles.summary}>{data.summary[lang]}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.experience}</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPosition}>{exp.position[lang]}</Text>
                  <Text style={styles.expPeriod}>{exp.period}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                <Text style={styles.expDescription}>{exp.description[lang]}</Text>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.education}</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.eduItem}>
                <View style={styles.expHeader}>
                  <Text style={styles.expPosition}>{edu.degree[lang]}</Text>
                  <Text style={styles.expPeriod}>{edu.year}</Text>
                </View>
                <Text style={styles.expCompany}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.skills}</Text>
            <View style={styles.skillGrid}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>{skill.pt}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

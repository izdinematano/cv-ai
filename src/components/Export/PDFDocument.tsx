'use client';

import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { CVData } from '@/store/useCVStore';

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2',
      fontWeight: 700,
    },
  ],
});

interface PDFDocumentProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export const CVDocument = ({ data, lang }: PDFDocumentProps) => {
  const accentColor = data.settings.accentColor || '#3b82f6';

  const styles = StyleSheet.create({
    page: {
      paddingTop: 42,
      paddingBottom: 42,
      paddingHorizontal: 40,
      fontFamily: 'Inter',
      color: '#1e293b',
      fontSize: 10.5,
    },
    header: {
      borderBottomWidth: 2,
      borderBottomColor: accentColor,
      paddingBottom: 18,
      marginBottom: 22,
    },
    name: {
      fontSize: 28,
      fontWeight: 700,
      color: '#0f172a',
      marginBottom: 4,
    },
    title: {
      fontSize: 15,
      color: accentColor,
      fontWeight: 700,
      marginBottom: 10,
    },
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    contactItem: {
      fontSize: 9.5,
      color: '#64748b',
    },
    section: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 11,
      textTransform: 'uppercase',
      color: accentColor,
      fontWeight: 700,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 4,
      marginBottom: 10,
      letterSpacing: 0.6,
    },
    summary: {
      fontSize: 10.5,
      lineHeight: 1.6,
      color: '#334155',
    },
    item: {
      marginBottom: 11,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 3,
      gap: 8,
    },
    itemTitle: {
      fontSize: 11.5,
      fontWeight: 700,
      color: '#0f172a',
    },
    itemPeriod: {
      fontSize: 9.5,
      color: '#64748b',
    },
    itemSubtitle: {
      fontSize: 10.5,
      fontWeight: 700,
      color: '#475569',
      marginBottom: 4,
    },
    itemDescription: {
      fontSize: 9.8,
      lineHeight: 1.55,
      color: '#334155',
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontSize: 9,
      fontWeight: 700,
    },
  });

  const t = {
    summary: lang === 'pt' ? 'Resumo' : 'Professional Summary',
    experience: lang === 'pt' ? 'Experiencia Profissional' : 'Professional Experience',
    education: lang === 'pt' ? 'Educacao' : 'Education',
    skills: lang === 'pt' ? 'Competencias' : 'Skills',
    languages: lang === 'pt' ? 'Idiomas' : 'Languages',
    projects: lang === 'pt' ? 'Projectos' : 'Projects',
    certifications: lang === 'pt' ? 'Certificacoes' : 'Certifications',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.fullName || 'Seu Nome'}</Text>
          <Text style={styles.title}>
            {data.personalInfo.jobTitle[lang] || 'Professional Title'}
          </Text>
          <View style={styles.contactGrid}>
            {data.personalInfo.email ? (
              <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
            ) : null}
            {data.personalInfo.phone ? (
              <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
            ) : null}
            {data.personalInfo.location ? (
              <Text style={styles.contactItem}>{data.personalInfo.location}</Text>
            ) : null}
            {data.personalInfo.linkedin ? (
              <Text style={styles.contactItem}>{data.personalInfo.linkedin}</Text>
            ) : null}
            {data.personalInfo.website ? (
              <Text style={styles.contactItem}>{data.personalInfo.website}</Text>
            ) : null}
          </View>
        </View>

        {data.summary[lang] ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.summary}</Text>
            <Text style={styles.summary}>{data.summary[lang]}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.experience}</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.position[lang]}</Text>
                  <Text style={styles.itemPeriod}>{exp.period}</Text>
                </View>
                {exp.company ? <Text style={styles.itemSubtitle}>{exp.company}</Text> : null}
                {exp.description[lang] ? (
                  <Text style={styles.itemDescription}>{exp.description[lang]}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.education}</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.degree[lang]}</Text>
                  <Text style={styles.itemPeriod}>{edu.year}</Text>
                </View>
                {edu.institution ? <Text style={styles.itemSubtitle}>{edu.institution}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.skills}</Text>
            <View style={styles.chipGrid}>
              {data.skills.map((skill, index) => (
                <Text key={`${skill.pt}-${skill.en}-${index}`} style={styles.chip}>
                  {skill[lang] || skill.pt || skill.en}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {data.languages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.languages}</Text>
            <View style={styles.chipGrid}>
              {data.languages.map((language, index) => (
                <Text key={`${language.name}-${index}`} style={styles.chip}>
                  {language.name} - {language.level[lang]}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.projects}</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={styles.item}>
                <Text style={styles.itemTitle}>{project.name}</Text>
                {project.link ? <Text style={styles.contactItem}>{project.link}</Text> : null}
                {project.description[lang] ? (
                  <Text style={styles.itemDescription}>{project.description[lang]}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {data.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.certifications}</Text>
            {data.certifications.map((cert) => (
              <View key={cert.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  <Text style={styles.itemPeriod}>{cert.year}</Text>
                </View>
                {cert.issuer ? <Text style={styles.itemSubtitle}>{cert.issuer}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

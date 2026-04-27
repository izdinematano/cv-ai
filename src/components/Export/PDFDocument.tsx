'use client';

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { CVData } from '@/store/useCVStore';

/* Deliberately using react-pdf's built-in Helvetica instead of Font.register
 * with an external Google Font URL. External fonts frequently fail to load
 * due to CORS and leave the PDF generator stuck in `loading` forever, which
 * is the most common reason users see "nothing happens" when clicking the
 * download button. */

interface PDFDocumentProps {
  data: CVData;
  lang: 'pt' | 'en';
}

const labels = {
  profile:        { pt: 'Perfil Profissional', en: 'Professional Summary' },
  experience:     { pt: 'Experiência Profissional', en: 'Professional Experience' },
  education:      { pt: 'Educação', en: 'Education' },
  skills:         { pt: 'Competências', en: 'Skills' },
  languages:      { pt: 'Idiomas', en: 'Languages' },
  projects:       { pt: 'Projetos', en: 'Projects' },
  certifications: { pt: 'Certificações', en: 'Certifications' },
  contact:        { pt: 'Contacto', en: 'Contact' },
};

export const CVDocument = ({ data, lang }: PDFDocumentProps) => {
  const accentColor = data.settings.accentColor || '#3b82f6';

  const s = StyleSheet.create({
    page: {
      paddingTop: 40,
      paddingBottom: 40,
      paddingHorizontal: 40,
      fontFamily: 'Helvetica',
      color: '#1e293b',
      fontSize: 10,
    },

    /* ── Header ── */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      borderBottomWidth: 2,
      borderBottomColor: accentColor,
      paddingBottom: 16,
      marginBottom: 20,
    },
    photo: {
      width: 64,
      height: 64,
      borderRadius: 32,
      objectFit: 'cover',
    },
    headerText: { flex: 1 },
    name: {
      fontSize: 24,
      fontWeight: 700,
      color: '#0f172a',
      marginBottom: 3,
    },
    title: {
      fontSize: 13,
      color: accentColor,
      fontWeight: 700,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    contactItem: {
      fontSize: 9,
      color: '#64748b',
    },

    /* ── Sections ── */
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 10.5,
      textTransform: 'uppercase',
      color: accentColor,
      fontWeight: 700,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 4,
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    summary: {
      fontSize: 10,
      lineHeight: 1.6,
      color: '#334155',
    },

    /* ── Items (experience, education, …) ── */
    item: { marginBottom: 10 },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
      gap: 8,
    },
    itemTitle: { fontSize: 11, fontWeight: 700, color: '#0f172a' },
    itemPeriod: { fontSize: 9, color: '#64748b' },
    itemSub: { fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 3 },
    itemDesc: { fontSize: 9.5, lineHeight: 1.55, color: '#334155' },

    /* ── Chips (skills, languages) ── */
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 4,
      fontSize: 9,
      fontWeight: 700,
    },
  });

  const contact = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          {data.personalInfo.photo ? (
            <Image src={data.personalInfo.photo} style={s.photo} />
          ) : null}
          <View style={s.headerText}>
            <Text style={s.name}>{data.personalInfo.fullName || 'Seu Nome'}</Text>
            <Text style={s.title}>
              {data.personalInfo.jobTitle[lang] || ''}
            </Text>
            <View style={s.contactRow}>
              {contact.map((c, i) => (
                <Text key={i} style={s.contactItem}>
                  {c}{i < contact.length - 1 ? '  ·' : ''}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── Summary ── */}
        {data.summary[lang] ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.profile[lang]}</Text>
            <Text style={s.summary}>{data.summary[lang]}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {data.experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.experience[lang]}</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={s.item} wrap={false}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{exp.position[lang]}</Text>
                  <Text style={s.itemPeriod}>{exp.period}</Text>
                </View>
                {exp.company ? <Text style={s.itemSub}>{exp.company}</Text> : null}
                {exp.description[lang] ? (
                  <Text style={s.itemDesc}>{exp.description[lang]}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Education ── */}
        {data.education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.education[lang]}</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={s.item} wrap={false}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{edu.degree[lang]}</Text>
                  <Text style={s.itemPeriod}>{edu.year}</Text>
                </View>
                {edu.institution ? <Text style={s.itemSub}>{edu.institution}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {data.skills.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.skills[lang]}</Text>
            <View style={s.chipGrid}>
              {data.skills.map((skill, i) => (
                <Text key={`sk-${i}`} style={s.chip}>
                  {skill[lang] || skill.pt || skill.en}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Languages ── */}
        {data.languages.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.languages[lang]}</Text>
            <View style={s.chipGrid}>
              {data.languages.map((l, i) => (
                <Text key={`lg-${i}`} style={s.chip}>
                  {l.name} – {l.level[lang]}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Projects ── */}
        {data.projects.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.projects[lang]}</Text>
            {data.projects.map((p) => (
              <View key={p.id} style={s.item} wrap={false}>
                <Text style={s.itemTitle}>{p.name}</Text>
                {p.link ? <Text style={s.contactItem}>{p.link}</Text> : null}
                {p.description[lang] ? (
                  <Text style={s.itemDesc}>{p.description[lang]}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Certifications ── */}
        {data.certifications.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{labels.certifications[lang]}</Text>
            {data.certifications.map((cert) => (
              <View key={cert.id} style={s.item} wrap={false}>
                <View style={s.itemRow}>
                  <Text style={s.itemTitle}>{cert.name}</Text>
                  <Text style={s.itemPeriod}>{cert.year}</Text>
                </View>
                {cert.issuer ? <Text style={s.itemSub}>{cert.issuer}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};

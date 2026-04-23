export const getTemplateRecommendation = (jobTitle: string) => {
  const title = jobTitle.toLowerCase();

  if (
    title.includes('software') ||
    title.includes('developer') ||
    title.includes('engineer') ||
    title.includes('tech') ||
    title.includes('it') ||
    title.includes('data') ||
    title.includes('product')
  ) {
    return {
      template: 'tech',
      reason: 'Este template destaca stack, experiencias tecnicas e projetos digitais com muita clareza.',
      badge: 'Tech / IT',
    };
  }

  if (
    title.includes('manager') ||
    title.includes('director') ||
    title.includes('diretor') ||
    title.includes('ceo') ||
    title.includes('executive') ||
    title.includes('gestor')
  ) {
    return {
      template: 'executive-v2',
      reason: 'Foco em lideranca, autoridade visual e narrativa orientada a resultados.',
      badge: 'Lideranca',
    };
  }

  if (
    title.includes('designer') ||
    title.includes('art') ||
    title.includes('creative') ||
    title.includes('marketing') ||
    title.includes('brand') ||
    title.includes('ux')
  ) {
    return {
      template: 'creative-v2',
      reason: 'Layout marcante para destacar criatividade, portfolio e trabalho visual.',
      badge: 'Criativo',
    };
  }

  if (
    title.includes('analyst') ||
    title.includes('finance') ||
    title.includes('operations') ||
    title.includes('consultant')
  ) {
    return {
      template: 'atlas',
      reason: 'Visual equilibrado e organizado para perfis analiticos, operacionais e consultivos.',
      badge: 'Atlas',
    };
  }

  if (
    title.includes('aluno') ||
    title.includes('estudante') ||
    title.includes('junior') ||
    title.includes('trainee') ||
    title.includes('intern')
  ) {
    return {
      template: 'student',
      reason: 'Ideal para inicio de carreira e para valorizar formacao, potencial e projetos.',
      badge: 'Estudante',
    };
  }

  return {
    template: 'corporate-v2',
    reason: 'Um design premium e versatil para diferentes areas profissionais.',
    badge: 'Profissional',
  };
};

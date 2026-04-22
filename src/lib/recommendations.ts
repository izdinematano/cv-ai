'use client';

export const getTemplateRecommendation = (jobTitle: string) => {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('software') || title.includes('developer') || title.includes('engineer') || title.includes('tech') || title.includes('it')) {
    return {
      template: 'tech',
      reason: 'Este template realça o seu stack tecnológico e projetos de código.',
      badge: 'Tech / IT'
    };
  }
  
  if (title.includes('manager') || title.includes('diretor') || title.includes('ceo') || title.includes('executive') || title.includes('gestor')) {
    return {
      template: 'executive-v2',
      reason: 'Foco em liderança e resultados estratégicos.',
      badge: 'Liderança'
    };
  }
  
  if (title.includes('designer') || title.includes('art') || title.includes('creative') || title.includes('marketing')) {
    return {
      template: 'creative-v2',
      reason: 'Layout dinâmico para destacar a sua criatividade.',
      badge: 'Criativo'
    };
  }
  
  if (title.includes('aluno') || title.includes('estudante') || title.includes('junior') || title.includes('trainee')) {
    return {
      template: 'student',
      reason: 'Ideal para quem está a começar e quer destacar a formação.',
      badge: 'Estudante'
    };
  }
  
  return {
    template: 'corporate',
    reason: 'Um design equilibrado para qualquer profissão.',
    badge: 'Profissional'
  };
};

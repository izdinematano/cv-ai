export const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

export type TranslationModel = 'advanced' | 'light';

const MODELS = {
  advanced: 'anthropic/claude-3.5-sonnet',
  light: 'google/gemini-2.0-flash-lite:free',
};

export async function translateCVField(
  text: string,
  from: 'pt' | 'en',
  to: 'pt' | 'en',
  modelType: TranslationModel = 'advanced'
) {
  if (!text) return '';
  
  const prompt = `
    You are a professional CV editor specializing in the international job market (Lusophone and English-speaking markets).
    Convert the following CV field from ${from === 'pt' ? 'Portuguese' : 'English'} to ${to === 'pt' ? 'Portuguese' : 'English'}.
    
    IMPORTANT RULES:
    1. NEVER do a literal translation.
    2. Adapt technical terms and job titles to the professional standard of the target language.
    3. Improve the impact and clarity of the text.
    4. Maintain the same formatting (e.g., bullet points if present).
    5. Context: The user is likely from Mozambique or a Lusophone country seeking international opportunities.
    
    TEXT TO CONVERT:
    "${text}"
    
    Output ONLY the converted text without any explanations or quotes.
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cv-gen-ai.local',
        'X-Title': 'CV Gen AI',
      },
      body: JSON.stringify({
        model: MODELS[modelType],
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI Translation error:', error);
    return text; // Fallback to original text
  }
}

export async function improveCVField(
  text: string,
  lang: 'pt' | 'en',
  modelType: TranslationModel = 'advanced'
) {
  if (!text) return '';
  
  const prompt = `
    You are a professional CV editor.
    Improve the following CV text in ${lang === 'pt' ? 'Portuguese' : 'English'} to make it more professional, impactful, and clear.
    
    IMPORTANT RULES:
    1. Keep the same language.
    2. Use action verbs and quantifiable achievements if possible.
    3. Maintain the same formatting.
    4. Output ONLY the improved text.
    
    TEXT TO IMPROVE:
    "${text}"
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS[modelType],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI Improvement error:', error);
    return text;
  }
}

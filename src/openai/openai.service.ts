import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  async suggestCategory(
    description: string,
    availableCategories: { id: string; name: string }[],
  ): Promise<{ categoryId: string; confidence: number } | null> {
    if (availableCategories.length === 0) return null;

    const categoriesList = availableCategories
      .map((c) => `${c.id}: ${c.name}`)
      .join('\n');

    const prompt = `
      Você é um assistente de categorização de despesas condominiais.
      Com base na descrição da despesa, escolha a categoria mais adequada dentre as opções.
      
      Categorias:
      ${categoriesList}
      
      Descrição: "${description}"
      
      Responda APENAS com um JSON no formato: {"categoryId": "id-da-categoria", "confidence": 0.0 a 1.0}
      Não inclua nenhum outro texto.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 150,
      });

      const content = completion.choices[0].message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.categoryId && typeof parsed.confidence === 'number') {
        return {
          categoryId: parsed.categoryId,
          confidence: parsed.confidence,
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao sugerir categoria:', error);
      return null;
    }
  }
}
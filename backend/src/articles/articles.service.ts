import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import type { GenerateArticleDto, GenerateArticleResponse } from './dto/generate-article.dto';

@Injectable()
export class ArticlesService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateArticle(dto: GenerateArticleDto): Promise<GenerateArticleResponse> {
    const { topic, answers } = dto;

    if (!topic || typeof topic !== 'string') {
      throw new Error('Topic is required');
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error('Answers must be a non-empty array');
    }

    // Create a structured prompt for article generation
    let interviewContext = `Topic: ${topic}\n\nInterview Q&A:\n`;
    for (const answer of answers) {
      const question = answer.question || '';
      const answerText = answer.answer || '';
      interviewContext += `\nQ: ${question}\nA: ${answerText}\n`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert article writer. Generate a well-structured, engaging article based on the interview Q&A provided. 
            The article should be between 300-500 words, have a clear narrative flow, and incorporate the insights from the interview naturally.
            Include an engaging title, introduction, body paragraphs, and conclusion. Write in a professional journalistic style.`,
          },
          {
            role: 'user',
            content: `Write an article (300-500 words) based on this interview:\n\n${interviewContext}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const article = response.choices[0].message.content?.trim() || '';
      const wordCount = article.split(/\s+/).length;

      return {
        article,
        word_count: wordCount,
      };
    } catch (error) {
      console.error('Error generating article:', error);
      throw new Error('Failed to generate article');
    }
  }
}
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { OpenAIService } from '../shared/openai.service';
import type { GenerateArticleDto, GenerateArticleResponse } from './dto/generate-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly openaiService: OpenAIService) {}

  async generateArticle(dto: GenerateArticleDto): Promise<GenerateArticleResponse> {
    const { topic, answers } = dto;

    if (!topic || typeof topic !== 'string') {
      throw new BadRequestException('Topic is required');
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new BadRequestException('Answers must be a non-empty array');
    }

    // Create a structured prompt for article generation
    const interviewContext = this.formatInterviewContext(topic, answers);

    try {
      const openai = this.openaiService.getClient();
      
      const response = await openai.chat.completions.create({
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
      const wordCount = article.split(/\s+/).filter(word => word.length > 0).length;

      return {
        article,
        word_count: wordCount,
      };
    } catch (error) {
      console.error('Error generating article:', error);
      throw new InternalServerErrorException('Failed to generate article');
    }
  }

  private formatInterviewContext(topic: string, answers: any[]): string {
    let context = `Topic: ${topic}\n\nInterview Q&A:\n`;
    
    for (const answer of answers) {
      const question = answer.question || '';
      const answerText = answer.answer || '';
      context += `\nQ: ${question}\nA: ${answerText}\n`;
    }
    
    return context;
  }
}
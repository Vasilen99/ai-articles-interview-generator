import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import type { GenerateQuestionsDto, GenerateQuestionsResponse, InterviewQuestion } from './dto/generate-questions.dto';

@Injectable()
export class QuestionsService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateQuestions(dto: GenerateQuestionsDto): Promise<GenerateQuestionsResponse> {
    const { topic } = dto;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      throw new Error('Topic must be a non-empty string');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert technical interviewer conducting a job interview. Generate between 3 and 5 thoughtful, open-ended interview questions about the given topic/role. 
            The questions should assess the candidate's knowledge, experience, and skills relevant to the position they are applying for.
            Questions should be insightful, encourage detailed responses showcasing expertise, and cover different aspects of the role and technical domain.
            Return the questions as a JSON array with this structure: {"questions": [{"id": 1, "question": "question text"}, ...]}`,
          },
          {
            role: 'user',
            content: `Generate 3-5 interview questions for a candidate applying for a position related to: ${topic}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content?.trim();
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const questionsData = JSON.parse(content);
      const questions = questionsData.questions || [];

      // Format questions
      const formattedQuestions: InterviewQuestion[] = [];
      for (let i = 0; i < Math.min(questions.length, 5); i++) {
        const q = questions[i];
        if (typeof q === 'object' && q.question) {
          formattedQuestions.push({
            id: i + 1,
            question: q.question,
          });
        } else if (typeof q === 'string') {
          formattedQuestions.push({
            id: i + 1,
            question: q,
          });
        }
      }

      return {
        topic,
        questions: formattedQuestions,
      };
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate questions');
    }
  }
}
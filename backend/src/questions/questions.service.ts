import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { OpenAIService } from '../shared/openai.service';
import type { GenerateQuestionsDto, GenerateQuestionsResponse, InterviewQuestion } from './dto/generate-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly openaiService: OpenAIService) {}

  async generateQuestions(dto: GenerateQuestionsDto): Promise<GenerateQuestionsResponse> {
    const { topic } = dto;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      throw new BadRequestException('Topic must be a non-empty string');
    }

    try {
      const openai = this.openaiService.getClient();
      
      const response = await openai.chat.completions.create({
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
        throw new InternalServerErrorException('No content received from OpenAI');
      }

      const questionsData = JSON.parse(content);
      const questions = questionsData.questions || [];

      // Format questions
      const formattedQuestions: InterviewQuestion[] = questions
        .slice(0, 5)
        .map((q: any, i: number) => ({
          id: i + 1,
          question: typeof q === 'object' ? q.question : q,
        }))
        .filter((q: InterviewQuestion) => q.question);

      return {
        topic,
        questions: formattedQuestions,
      };
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new InternalServerErrorException('Failed to generate questions');
    }
  }
}
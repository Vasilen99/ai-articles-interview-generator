import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import type { GenerateQuestionsDto, GenerateQuestionsResponse } from './dto/generate-questions.dto';

@Controller('api/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('generate')
  async generateQuestions(@Body() dto: GenerateQuestionsDto): Promise<GenerateQuestionsResponse> {
    try {
      return await this.questionsService.generateQuestions(dto);
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to generate questions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import type { GenerateArticleDto, GenerateArticleResponse } from './dto/generate-article.dto';

@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('generate')
  async generateArticle(@Body() dto: GenerateArticleDto): Promise<GenerateArticleResponse> {
    try {
      return await this.articlesService.generateArticle(dto);
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Failed to generate article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
import { Module } from '@nestjs/common';
import { QuestionsModule } from './questions/questions.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [QuestionsModule, ArticlesModule],
})
export class AppModule {}

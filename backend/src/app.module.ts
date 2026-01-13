import { Module } from '@nestjs/common';
import { QuestionsModule } from './questions/questions.module';
import { ArticlesModule } from './articles/articles.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, QuestionsModule, ArticlesModule],
})
export class AppModule {}

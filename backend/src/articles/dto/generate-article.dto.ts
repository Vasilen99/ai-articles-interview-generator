export interface Answer {
  question: string;
  answer: string;
  inputMethod?: 'text' | 'voice';
}

export interface GenerateArticleDto {
  topic: string;
  answers: Answer[];
}

export interface GenerateArticleResponse {
  article: string;
  word_count: number;
}
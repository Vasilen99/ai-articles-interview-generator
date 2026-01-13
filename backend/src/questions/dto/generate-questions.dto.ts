export interface GenerateQuestionsDto {
  topic: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
}

export interface GenerateQuestionsResponse {
  topic: string;
  questions: InterviewQuestion[];
}
export interface InterviewQuestion {
  id: number;
  question: string;
}

export interface GenerateQuestionsRequest {
  topic: string;
}

export interface GenerateQuestionsResponse {
  topic: string;
  questions: InterviewQuestion[];
}

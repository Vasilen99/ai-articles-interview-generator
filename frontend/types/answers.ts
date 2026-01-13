export interface Answer {
  questionId: number;
  answer: string;
  inputMethod: 'text' | 'voice';
}

export interface SubmitAnswersRequest {
  topic: string;
  answers: Answer[];
}

export interface SubmitAnswersResponse {
  success: boolean;
  message: string;
  answersCount: number;
}

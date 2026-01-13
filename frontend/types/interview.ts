export interface InterviewTopic {
  topic: string;
  timestamp?: Date;
}

export interface InterviewArticle {
  id?: string;
  topic: string;
  content: string;
  createdAt: Date;
}

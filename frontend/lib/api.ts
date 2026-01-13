import type { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@/types/questions';
import type { Answer } from '@/types/answers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function generateQuestions(topic: string): Promise<GenerateQuestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/questions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic } as GenerateQuestionsRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate questions' }));
    throw new Error(error.error || 'Failed to generate questions');
  }

  return response.json();
}

export async function generateArticle(topic: string, answers: Answer[]) {
  const response = await fetch(`${API_BASE_URL}/api/articles/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, answers }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate article' }));
    throw new Error(error.error || 'Failed to generate article');
  }

  return response.json();
}

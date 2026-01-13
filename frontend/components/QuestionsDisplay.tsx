'use client';

import { InterviewQuestion } from '@/types/questions';

interface QuestionsDisplayProps {
  topic: string;
  questions: InterviewQuestion[];
  onAnswerQuestions: () => void;
  onReset: () => void;
}

export default function QuestionsDisplay({ 
  topic, 
  questions, 
  onAnswerQuestions,
  onReset 
}: QuestionsDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Questions
          </h2>
          <p className="text-sm text-gray-600">
            Topic: <span className="font-medium text-gray-900">{topic}</span>
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div 
              key={question.id}
              className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="shrink-0">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-medium text-sm">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">{question.question}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onAnswerQuestions}
            className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Answer Questions
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}

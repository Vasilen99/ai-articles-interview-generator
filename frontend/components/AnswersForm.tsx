"use client";

import { useState } from "react";
import { InterviewQuestion } from "@/types/questions";
import { Answer } from "@/types/answers";
import QuestionAnswerInput from "./QuestionAnswerInput";

interface AnswersFormProps {
  topic: string;
  questions: InterviewQuestion[];
  onSubmit: (answers: Answer[]) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function AnswersForm({
  topic,
  questions,
  onSubmit,
  onBack,
  isSubmitting = false,
}: AnswersFormProps) {
  const [answers, setAnswers] = useState<
    Map<number, { answer: string; method: "text" | "voice" }>
  >(new Map());

  const handleAnswerChange = (
    questionId: number,
    answer: string,
    method: "text" | "voice"
  ) => {
    setAnswers(new Map(answers.set(questionId, { answer, method })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const answersArray: Answer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers.get(q.id)?.answer || "",
      inputMethod: answers.get(q.id)?.method || "text",
    }));

    onSubmit(answersArray);
  };

  const allQuestionsAnswered = questions.every((q) => {
    const answer = answers.get(q.id)?.answer || "";
    return answer.trim().length > 0;
  });

  const answeredCount = Array.from(answers.values()).filter(
    (a) => a.answer.trim().length > 0
  ).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Answer Questions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Topic: <span className="font-medium text-gray-900">{topic}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {answeredCount}/{questions.length}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <QuestionAnswerInput
            key={question.id}
            question={question.question}
            questionNumber={index + 1}
            value={answers.get(question.id)?.answer || ""}
            onChange={(answer, method) =>
              handleAnswerChange(question.id, answer, method)
            }
          />
        ))}

        <div className="flex gap-3 pt-6 sticky bottom-4 bg-gray-50 p-4 rounded-lg shadow-lg">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back to Questions
          </button>
          <button
            type="submit"
            disabled={!allQuestionsAnswered || isSubmitting}
            className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting Answers...
              </span>
            ) : (
              `Submit All Answers (${answeredCount}/${questions.length})`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

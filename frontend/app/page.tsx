"use client";

import { useState } from "react";
import TopicInput from "@/components/TopicInput";
import QuestionsDisplay from "@/components/QuestionsDisplay";
import AnswersForm from "@/components/AnswersForm";
import { generateQuestions, generateArticle } from "@/lib/api";
import { InterviewQuestion } from "@/types/questions";
import { Answer } from "@/types/answers";

type Step = "topic" | "questions" | "answers" | "generating" | "complete";

export default function Home() {
  const [step, setStep] = useState<Step>("topic");
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState<string>("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [error, setError] = useState<string>("");
  const [article, setArticle] = useState<string>("");

  const handleTopicSubmit = async (submittedTopic: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await generateQuestions(submittedTopic);
      setTopic(response.topic);
      setQuestions(response.questions);
      setStep("questions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
      console.error("Error generating questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (newStep: Step) => {
    setStep(newStep);
  };

  const handleSubmitAnswers = async (answers: Answer[]) => {
    setIsLoading(true);
    setError("");
    setStep("generating");

    try {
      const articleResponse = await generateArticle(topic, answers);
      setArticle(articleResponse.article);
      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate article");
      console.error("Error generating article:", err);
      setStep("answers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("topic");
    setTopic("");
    setQuestions([]);
    setError("");
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Interview Article Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate compelling interview articles on any topic using AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {step === "topic" && (
          <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} />
        )}

        {step === "questions" && (
          <QuestionsDisplay
            topic={topic}
            questions={questions}
            onAnswerQuestions={() => handleStepChange("answers")}
            onReset={handleReset}
          />
        )}

        {step === "answers" && (
          <AnswersForm
            topic={topic}
            questions={questions}
            onSubmit={handleSubmitAnswers}
            onBack={() => handleStepChange("questions")}
            isSubmitting={isLoading}
          />
        )}

        {step === "generating" && (
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Generating Your Article
                </h2>
                <p className="text-gray-600">
                  Our AI is crafting a compelling article based on your
                  interview answers...
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Article Generated!
              </h2>
              <p className="text-gray-600 mb-6">
                Based on your interview about: <strong>{topic}</strong>
              </p>
            </div>

            {article && (
              <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {article}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleReset}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

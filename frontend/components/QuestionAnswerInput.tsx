"use client";

import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

interface QuestionAnswerInputProps {
  question: string;
  questionNumber: number;
  value: string;
  onChange: (value: string, method: "text" | "voice") => void;
}

export default function QuestionAnswerInput({
  question,
  questionNumber,
  value,
  onChange,
}: QuestionAnswerInputProps) {
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value, "text");
  };

  const handleTranscript = (transcript: string) => {
    const newAnswer = value ? `${value} ${transcript}` : transcript;
    onChange(newAnswer.trim(), "voice");
  };

  const toggleInputMode = () => {
    setInputMode(inputMode === "text" ? "voice" : "text");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-medium text-sm shrink-0">
            {questionNumber}
          </span>
          <p className="text-gray-800 font-medium leading-relaxed">
            {question}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Your Answer
          </label>
          <button
            type="button"
            onClick={toggleInputMode}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {inputMode === "text" ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                Switch to Voice
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Switch to Text
              </>
            )}
          </button>
        </div>

        {inputMode === "text" ? (
          <textarea
            value={value}
            onChange={handleTextChange}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          />
        ) : (
          <div className="space-y-3">
            <VoiceRecorder
              onTranscript={handleTranscript}
              isRecording={isRecording}
              onRecordingChange={setIsRecording}
            />
            {value && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Edit Transcription
                </label>
                <textarea
                  value={value}
                  onChange={handleTextChange}
                  placeholder="Edit your transcribed answer..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{value.length} characters</span>
          {value && (
            <span className="text-green-600 font-medium">✓ Answered</span>
          )}
        </div>
      </div>
    </div>
  );
}

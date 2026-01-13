"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export default function VoiceRecorder({
  onTranscript,
  isRecording,
  onRecordingChange,
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef(false); // Prevent duplicate calls
  const mimeTypeRef = useRef<string>("audio/webm"); // Store mime type
  const recognitionRef = useRef<any>(null); // Web Speech API
  const interimTranscriptRef = useRef<string>(""); // Store interim results

  // Initialize and start Web Speech API for real-time preview
  const startSpeechRecognition = () => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = interimTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      interimTranscriptRef.current = finalTranscript;

      // Update UI with real-time transcript (both final and interim)
      const fullTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        // Don't show error for no-speech, it's normal when pausing
        setError(`Speech recognition: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    }
  };

  const startRecording = async () => {
    try {
      setError("");
      setTranscript(""); // Clear previous transcript
      interimTranscriptRef.current = "";

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to use MP3 or fallback to other formats
      let mimeType = "audio/webm";
      const supportedTypes = [
        "audio/mp4",
        "audio/mpeg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      mimeTypeRef.current = mimeType; // Store for later use

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Start Web Speech API for real-time preview
      startSpeechRecognition();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Prevent duplicate processing
        if (isProcessingRef.current) {
          return;
        }

        isProcessingRef.current = true;
        setIsProcessing(true);

        const mimeType = mimeTypeRef.current;
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Check if audio was actually recorded
        if (audioBlob.size < 1000) {
          setError(
            "Recording too short or empty. Please speak for at least 1 second."
          );
          setIsProcessing(false);
          isProcessingRef.current = false;
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        try {
          // Send to Whisper API
          const formData = new FormData();

          // Determine file extension based on mime type
          let extension = "webm";
          if (mimeType.includes("mp4")) extension = "mp4";
          else if (mimeType.includes("mpeg")) extension = "mp3";

          formData.append("audio", audioBlob, `recording.${extension}`);

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            console.error("Transcription error:", errorData);
            throw new Error(errorData.error || "Transcription failed");
          }

          const data = await response.json();
          const transcribedText = data.text || "";

          if (!transcribedText) {
            // If Whisper returns empty, use the interim transcript from speech recognition
            const fallbackText = interimTranscriptRef.current.trim();
            if (fallbackText) {
              setTranscript(fallbackText);
              onTranscript(fallbackText);
            } else {
              throw new Error("No speech detected in recording");
            }
          } else {
            // Use Whisper's more accurate transcription
            setTranscript(transcribedText);
            onTranscript(transcribedText);
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to transcribe audio";

          // On error, try to use the speech recognition transcript as fallback
          const fallbackText = interimTranscriptRef.current.trim();
          if (fallbackText) {
            setTranscript(fallbackText);
            onTranscript(fallbackText);
          } else {
            setError(errorMessage);
            console.error("Transcription error:", err);
          }
        } finally {
          setIsProcessing(false);
          isProcessingRef.current = false;
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      onRecordingChange(true);
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
    }

    // Stop speech recognition
    stopSpeechRecognition();
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      stopSpeechRecognition();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isRecording
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Stop Recording
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
              Start Recording
            </>
          )}
        </button>

        {isProcessing && (
          <span className="text-sm text-gray-600">Processing audio...</span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {(transcript || isRecording) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            {isRecording ? "Live Transcript" : "Final Transcript"}
            {isProcessing && " (Refining with Whisper AI...)"}
          </h4>
          <p className="text-sm text-gray-700">
            {isRecording && !transcript ? (
              <span className="italic">Listening... speak now</span>
            ) : (
              transcript || "No speech detected yet"
            )}
          </p>
          {isRecording && transcript && (
            <p className="text-xs text-blue-600 mt-2 italic">
              Text appears in real-time as you speak ✨
            </p>
          )}
        </div>
      )}
    </div>
  );
}

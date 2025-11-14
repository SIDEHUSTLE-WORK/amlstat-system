/// <reference types="node" />
// src/components/chat/AudioRecorder.tsx
import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setRecordingTime(0);
    onCancel();
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-2 border-fia-teal rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Voice Message</h3>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Recording Visualization */}
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Mic Icon */}
        <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isRecording 
              ? 'bg-gradient-to-br from-red-500 to-red-700' 
              : audioBlob
              ? 'bg-gradient-to-br from-green-500 to-green-700'
              : 'bg-gradient-to-br from-fia-navy to-fia-teal'
          }`}>
            <Mic className="w-12 h-12 text-white" />
          </div>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
          )}
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {formatTime(recordingTime)}
          </p>
          <p className="text-sm text-gray-600">
            {isRecording ? 'Recording...' : audioBlob ? 'Recording complete!' : 'Ready to record'}
          </p>
        </div>

        {/* Waveform Animation (when recording) */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-fia-teal rounded-full animate-wave"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="btn-primary flex items-center space-x-2 px-8 py-4"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Stop Recording</span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={handleCancel}
                className="btn-outline flex items-center space-x-2 px-6 py-4"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
              <button
                onClick={handleSend}
                className="btn-primary flex items-center space-x-2 px-6 py-4"
              >
                <Send className="w-5 h-5" />
                <span>Send Voice Message</span>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
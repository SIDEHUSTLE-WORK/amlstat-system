// src/components/chat/MessageInput.tsx
import { useState } from 'react';
import { Send, Paperclip, Mic, Smile, X } from 'lucide-react';
import FileUpload from './FileUpload';
import AudioRecorder from './AudioRecorder';

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[], audioBlob?: Blob) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSend = () => {
    if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(message.trim(), selectedFiles);
      setMessage('');
      setSelectedFiles([]);
      setShowFileUpload(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAudioRecordingComplete = (audioBlob: Blob) => {
    onSendMessage('', [], audioBlob);
    setShowAudioRecorder(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Attach Files</h3>
            <button
              onClick={() => {
                setShowFileUpload(false);
                setSelectedFiles([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FileUpload
            onFilesSelected={setSelectedFiles}
            maxFiles={5}
            maxSizeMB={10}
          />
        </div>
      )}

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <AudioRecorder
            onRecordingComplete={handleAudioRecordingComplete}
            onCancel={() => setShowAudioRecorder(false)}
          />
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={disabled || showAudioRecorder}
              className={`p-3 rounded-lg transition-colors ${
                showFileUpload
                  ? 'bg-fia-teal text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAudioRecorder(!showAudioRecorder)}
              disabled={disabled || showFileUpload}
              className={`p-3 rounded-lg transition-colors ${
                showAudioRecorder
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Record voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={disabled || showAudioRecorder}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '52px', maxHeight: '150px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && selectedFiles.length === 0) || showAudioRecorder}
            className="p-3 bg-gradient-to-br from-fia-navy to-fia-teal text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && !showFileUpload && (
          <div className="mt-3 flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">
              {selectedFiles.length} file(s) attached
            </span>
            <button
              onClick={() => {
                setSelectedFiles([]);
                setShowFileUpload(false);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
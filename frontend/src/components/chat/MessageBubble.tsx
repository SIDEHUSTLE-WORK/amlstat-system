// src/components/chat/MessageBubble.tsx
import { useState } from 'react';
import { 
  File, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Download,
  CheckCheck,
  Check,
  Play,
  Pause
} from 'lucide-react';
import type { ChatMessage } from '../../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export default function MessageBubble({ message, isOwnMessage, showSender = true }: MessageBubbleProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'audio':
        return <Mic className="w-5 h-5" />;
      case 'pdf':
      case 'document':
      case 'excel':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender Name */}
        {showSender && !isOwnMessage && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <span className="text-xs font-semibold text-gray-600">
              {message.senderName}
            </span>
            {message.senderOrgCode && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {message.senderOrgCode}
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? 'bg-gradient-to-br from-fia-navy to-fia-teal text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Text Content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`space-y-2 ${message.content ? 'mt-3' : ''}`}>
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {/* Image Preview */}
                  {attachment.fileType === 'image' && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      />
                    </div>
                  )}

                  {/* Audio Player */}
                  {attachment.fileType === 'audio' && (
                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isOwnMessage ? 'bg-white/10' : 'bg-white'
                    }`}>
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className={`p-2 rounded-full transition-colors ${
                          isOwnMessage 
                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                            : 'bg-fia-teal/10 hover:bg-fia-teal/20 text-fia-teal'
                        }`}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`h-1 rounded-full ${
                          isOwnMessage ? 'bg-white/20' : 'bg-gray-300'
                        }`}>
                          <div className={`h-1 rounded-full w-0 ${
                            isOwnMessage ? 'bg-white' : 'bg-fia-teal'
                          }`} />
                        </div>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Voice message • 0:45
                        </p>
                      </div>
                    </div>
                  )}

                  {/* File Download */}
                  {attachment.fileType !== 'image' && attachment.fileType !== 'audio' && (
                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isOwnMessage ? 'bg-white/10' : 'bg-white'
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        isOwnMessage ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {getFileIcon(attachment.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isOwnMessage ? 'text-white' : 'text-gray-900'
                        }`}>
                          {attachment.fileName}
                        </p>
                        <p className={`text-xs ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                      <button
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                        className={`p-2 rounded-lg transition-colors ${
                          isOwnMessage 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp & Read Status */}
        <div className={`flex items-center space-x-2 mt-1 px-1 ${
          isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        }`}>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
          {isOwnMessage && (
            <div>
              {message.readBy.length > 1 ? (
                <CheckCheck className="w-4 h-4 text-fia-teal" />
              ) : (
                <Check className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
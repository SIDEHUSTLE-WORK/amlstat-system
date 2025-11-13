// src/components/chat/ChatWindow.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Info } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { ChatMessage, Conversation } from '../../types/chat';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string, files?: File[], audioBlob?: Blob) => void;
  onBack?: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Conversation Selected</h3>
          <p className="text-gray-600">
            Select a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back Button (Mobile) */}
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Participant Info */}
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                otherParticipant?.type === 'admin'
                  ? 'bg-gradient-to-br from-fia-navy to-fia-teal'
                  : 'bg-gradient-to-br from-blue-500 to-blue-700'
              }`}>
                {otherParticipant?.name.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {otherParticipant?.name || 'Unknown'}
                </h3>
                {otherParticipant?.orgCode && (
                  <p className="text-sm text-gray-600">{otherParticipant.orgCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Voice call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Video call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Conversation info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const showSender = index === 0 || messages[index - 1].senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showSender={showSender}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} />

      {/* Info Sidebar */}
      {showInfo && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Conversation Info</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Participant Details */}
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 ${
                otherParticipant?.type === 'admin'
                  ? 'bg-gradient-to-br from-fia-navy to-fia-teal'
                  : 'bg-gradient-to-br from-blue-500 to-blue-700'
              }`}>
                {otherParticipant?.name.charAt(0) || '?'}
              </div>
              <h4 className="font-bold text-gray-900">{otherParticipant?.name}</h4>
              {otherParticipant?.orgCode && (
                <p className="text-sm text-gray-600">{otherParticipant.orgCode}</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Conversation Type</p>
              <p className="font-medium text-gray-900">
                {conversation.type === 'admin_to_org' ? 'Admin ↔ Organization' : 'Organization ↔ Organization'}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Started</p>
              <p className="font-medium text-gray-900">
                {new Date(conversation.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Total Messages</p>
              <p className="font-medium text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
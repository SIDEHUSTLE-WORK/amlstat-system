// src/components/chat/ChatList.tsx
import { Search, Plus, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { Conversation } from '../../types/chat';

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewChat?: () => void;
}

export default function ChatList({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
  onNewChat,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.orgCode?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-fia-navy">Messages</h2>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="p-2 hover:bg-fia-teal/10 rounded-lg transition-colors text-fia-teal"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No conversations</h3>
            <p className="text-gray-600 text-sm">
              {searchQuery ? 'No results found' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isActive = conversation.id === activeConversationId;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-fia-teal/5 border-r-4 border-fia-teal' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                      otherParticipant?.type === 'admin' 
                        ? 'bg-gradient-to-br from-fia-navy to-fia-teal' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {otherParticipant?.name.charAt(0) || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold text-gray-900 truncate ${
                            hasUnread ? 'font-bold' : ''
                          }`}>
                            {otherParticipant?.name || 'Unknown'}
                          </h3>
                          {otherParticipant?.orgCode && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {otherParticipant.orgCode}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {hasUnread && (
                          <span className="ml-2 bg-fia-teal text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
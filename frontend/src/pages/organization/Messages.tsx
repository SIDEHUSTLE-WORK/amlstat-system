// src/pages/organization/Messages.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import { useChatStore } from '../../store/chatStore';
import { useAppStore } from '../../store';
import { Plus, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Conversation } from '../../types/chat';
import {
  sendMessage,
  sendMessageWithFiles,
  sendMessageWithAudio,
} from '../../services/chatService';

export default function OrganizationMessages() {
  const navigate = useNavigate();
  const { currentUser: appUser } = useAppStore();
  const {
    currentUser,
    conversations,
    messages,
    activeConversationId,
    setCurrentUser,
    setActiveConversation,
    addMessage,
    markAsRead,
    createConversation,
  } = useChatStore();

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatType, setChatType] = useState<'fia' | 'org'>('fia');

  // Initialize chat user
  useEffect(() => {
    if (appUser && appUser.organization && !currentUser) {
      setCurrentUser({
        id: appUser.id,
        name: appUser.name,
        type: 'organization',
        organizationId: appUser.organizationId,
        organizationCode: appUser.organization.code,
        organizationName: appUser.organization.name,
      });
    }
  }, [appUser, currentUser, setCurrentUser]);

  // Mock organizations list (other organizations to chat with)
  const organizations = [
    { id: 'org-1', name: 'Bank of Uganda', code: 'BOU' },
    { id: 'org-2', name: 'Uganda Revenue Authority', code: 'URA' },
    { id: 'org-3', name: 'Uganda Bureau of Statistics', code: 'UBOS' },
    { id: 'org-4', name: 'Inspector General of Government', code: 'IGG' },
    { id: 'org-5', name: 'National Social Security Fund', code: 'NSSF' },
    { id: 'org-6', name: 'Capital Markets Authority', code: 'CMA' },
  ].filter(org => org.id !== appUser?.organizationId); // Exclude own organization

  const filteredItems = chatType === 'fia'
    ? [{ id: 'admin-1', name: 'FIA Uganda', code: 'FIA' }]
    : organizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    if (currentUser) {
      markAsRead(conversationId, currentUser.id);
    }
  };

  const handleSendMessage = async (content: string, files?: File[], audioBlob?: Blob) => {
    if (!activeConversationId || !currentUser) return;

    try {
      let newMessage;

      if (audioBlob) {
        // Send audio message
        newMessage = await sendMessageWithAudio(
          activeConversationId,
          {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderType: 'organization',
            senderOrgCode: currentUser.organizationCode,
            content: content || 'Voice message',
          },
          audioBlob
        );
      } else if (files && files.length > 0) {
        // Send message with files
        newMessage = await sendMessageWithFiles(
          activeConversationId,
          {
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderType: 'organization',
            senderOrgCode: currentUser.organizationCode,
            content,
            messageType: 'file',
          },
          files
        );
      } else {
        // Send text message
        newMessage = await sendMessage(activeConversationId, {
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderType: 'organization',
          senderOrgCode: currentUser.organizationCode,
          content,
          messageType: 'text',
        });
      }

      // @ts-ignore - TypeScript type inference issue, object structure is correct
      addMessage(activeConversationId, newMessage);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCreateConversation = (recipientId: string) => {
    if (!currentUser) return;

    const recipient = chatType === 'fia'
      ? { id: 'admin-1', name: 'FIA Admin', type: 'admin' as const }
      : organizations.find(o => o.id === recipientId);

    if (!recipient) return;

    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.some(p => p.id === recipientId)
    );

    if (existingConv) {
      setActiveConversation(existingConv.id);
      setShowNewChatModal(false);
      toast.success(`Opened conversation with ${recipient.name}`);
      return;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { 
          id: currentUser.id, 
          name: currentUser.name, 
          type: 'organization',
          orgCode: currentUser.organizationCode,
        },
        chatType === 'fia'
          ? { id: recipientId, name: recipient.name, type: 'admin' }
          : { 
              id: recipientId, 
              name: recipient.name, 
              type: 'organization',
              orgCode: 'code' in recipient ? recipient.code : undefined,
            },
      ],
      type: chatType === 'fia' ? 'admin_to_org' : 'org_to_org',
      lastMessageAt: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };

    createConversation(newConversation);
    setActiveConversation(newConversation.id);
    setShowNewChatModal(false);
    toast.success(`Started conversation with ${recipient.name}`);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Chat List */}
        <div className="w-80 flex-shrink-0">
          <ChatList
            conversations={conversations}
            activeConversationId={activeConversationId}
            currentUserId={currentUser?.id || ''}
            onSelectConversation={handleSelectConversation}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>

        {/* Chat Window */}
        <ChatWindow
          conversation={activeConversation || null}
          messages={activeMessages}
          currentUserId={currentUser?.id || ''}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Start New Conversation</h2>
                  <p className="text-white/80">Message FIA or other organizations</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Chat Type Selector */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setChatType('fia')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    chatType === 'fia'
                      ? 'bg-fia-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Message FIA
                </button>
                <button
                  onClick={() => setChatType('org')}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    chatType === 'org'
                      ? 'bg-fia-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Message Organizations
                </button>
              </div>

              {chatType === 'org' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organizations..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Recipients List */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCreateConversation(item.id)}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg ${
                      chatType === 'fia'
                        ? 'bg-gradient-to-br from-fia-navy to-fia-teal'
                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.code}</p>
                    </div>
                    <Plus className="w-5 h-5 text-fia-teal" />
                  </button>
                ))}

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No results found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
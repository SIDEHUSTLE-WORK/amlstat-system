// src/pages/admin/Messages.tsx
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

export default function AdminMessages() {
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
  const [searchOrg, setSearchOrg] = useState('');

  // Initialize chat user
  useEffect(() => {
    if (appUser && !currentUser) {
      setCurrentUser({
        id: appUser.id,
        name: appUser.name,
        type: 'admin',
      });
    }
  }, [appUser, currentUser, setCurrentUser]);

  // Mock organizations list
  const organizations = [
    { id: 'org-1', name: 'Bank of Uganda', code: 'BOU' },
    { id: 'org-2', name: 'Uganda Revenue Authority', code: 'URA' },
    { id: 'org-3', name: 'Uganda Bureau of Statistics', code: 'UBOS' },
    { id: 'org-4', name: 'Inspector General of Government', code: 'IGG' },
    { id: 'org-5', name: 'Directorate of Public Prosecutions', code: 'DPP' },
    { id: 'org-6', name: 'Uganda Police Force', code: 'UPF' },
    { id: 'org-7', name: 'National Social Security Fund', code: 'NSSF' },
    { id: 'org-8', name: 'Capital Markets Authority', code: 'CMA' },
    { id: 'org-9', name: 'Insurance Regulatory Authority', code: 'IRA' },
    { id: 'org-10', name: 'Uganda Communications Commission', code: 'UCC' },
  ];

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
    org.code.toLowerCase().includes(searchOrg.toLowerCase())
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
            senderType: 'admin',
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
            senderType: 'admin',
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
          senderType: 'admin',
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

  const handleCreateConversation = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org || !currentUser) return;

    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.some(p => p.id === orgId)
    );

    if (existingConv) {
      setActiveConversation(existingConv.id);
      setShowNewChatModal(false);
      toast.success(`Opened conversation with ${org.name}`);
      return;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { id: currentUser.id, name: currentUser.name, type: 'admin' },
        { id: orgId, name: org.name, type: 'organization', orgCode: org.code },
      ],
      type: 'admin_to_org',
      lastMessageAt: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };

    createConversation(newConversation);
    setActiveConversation(newConversation.id);
    setShowNewChatModal(false);
    toast.success(`Started conversation with ${org.name}`);
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
                  <p className="text-white/80">Select an organization to message</p>
                </div>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  placeholder="Search organizations..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
                />
              </div>
            </div>

            {/* Organizations List */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              <div className="space-y-2">
                {filteredOrgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleCreateConversation(org.id)}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                      {org.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-600">{org.code}</p>
                    </div>
                    <Plus className="w-5 h-5 text-fia-teal" />
                  </button>
                ))}

                {filteredOrgs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No organizations found</p>
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
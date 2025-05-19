// components/UserInteractionDialog.tsx

import { useState } from "react";

import { Message } from "@prisma/client";
import { AuthUser } from "@/models/auth";
import UserDetailsDialog from "./user-details";
import ChatWindow from "./messaging/chat-window";

interface UserInteractionDialogProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  currentUser: AuthUser;
}

const UserInteractionDialog: React.FC<UserInteractionDialogProps> = ({
  userId,
  open,
  onClose,
  currentUser,
}) => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>("");

  const handleMessageClick = async () => {
    setShowChat(true)
    try {
        if (!userId) {
            throw new Error('No user selected');
          }
   
        const res = await fetch(`/api/conversations/with/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to create or fetch conversation');
          }
    
        const data = await res.json();
        setConversationId(data.id);
        setMessages(data.messages || []);
        setShowChat(true);
      } catch (error) {
        console.error('Error initiating conversation:', error);
        // Handle error (e.g., show notification to the user)
      }
  };

  const handleChatClose = () => {
    setShowChat(false);
  };

//   const handleMessageSent = (message: Message) => {
//     setMessages((prev) => [...prev, message]);
//   };

  return (
    <>
      <UserDetailsDialog
        userId={userId}
        open={open && !showChat}
        onClose={onClose}
        onMessageClick={handleMessageClick}
      />
  
  <ChatWindow
        open={showChat}
        onClose={handleChatClose}
        messages={messages}
        currentUser={currentUser}
        conversationId={conversationId}
        onMessageSent={(msg) => setMessages(prev => [...prev, msg])}
      />
  
    </>
  );
};

export default UserInteractionDialog;

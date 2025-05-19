"use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { Message, User } from "@prisma/client";

// import MessageBubble from "@/components/messaging/message-buble";
import ConversationList from "@/components/messaging/conversation-list";
// import { AuthUser } from "@/models/auth";

// type FullMessage = Message & {
//   sender: Pick<User, "id" | "name" | "username" | "image">;
// };

// type ConversationGroup = {
//   id: string;
//   users: Pick<User, "id" | "name" | "username" | "image">[];
//   messages: FullMessage[];
// };

const AllMessagesPage: React.FC = () => {
  // const { data: session } = useSession();
  // const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  // const currentUser = session?.user as AuthUser;

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     const res = await fetch("/api/messages");
  //     const data = await res.json();
  //     setConversations(data);
  //   };

  //   fetchMessages();
  // }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List Sidebar */}
        <div className="lg:col-span-1">
          <ConversationList />
        </div>
        
        {/* Chat Window Area - Initially hidden on mobile */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="rounded-lg border p-4 h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-zinc-800">
            <p className="text-gray-500 dark:text-gray-400">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;

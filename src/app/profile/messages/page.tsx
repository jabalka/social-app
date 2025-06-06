"use client";

import ConversationList from "@/components/messaging/conversation-list";

const AllMessagesPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">All Messages</h1>
      <div className="flex h-[70vh] w-[50vh] md:w-[60vh] lg:w-[80vh] rounded-lg border bg-gray-50 p-4 dark:bg-zinc-800">
        <div className="grid grid-cols-1 gap-6">
          {/* Conversation List Sidebar */}
          <div className="lg:col-span-1">
            <ConversationList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;

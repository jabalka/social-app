// // hooks/useSendMessage.ts
// import { useState } from 'react';
// // import { emitSocketEvent } from '@/lib/socket-client';
// import { Message } from '@prisma/client';

// export const useSendMessage = () => {
//   const [isSending, setIsSending] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // const sendMessage = async (message: Message) => {
//   //   setIsSending(true);
//   //   setError(null);
    
//   //   return new Promise<boolean>((resolve) => {
//   //     // emitSocketEvent('message:send', message, (response) => {
//   //     //   setIsSending(false);
//   //     //   if (!response.success) {
//   //     //     setError(response.error);
//   //     //   }
//   //     //   resolve(response.success);
//   //     // });
//   //   });
//   };

//   // return { sendMessage, isSending, error };
// };
'use client';

import { useState } from 'react';

const SendTestEmailPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus('Sending...');
    const res = await fetch('/api/send-interview-email', {
      method: 'POST',
    });

    if (res.ok) {
      setStatus('✅ Email sent successfully!');
    } else {
      const error = await res.json();
      setStatus(`❌ Failed: ${error.error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Send Test Email</h1>
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send Email
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
};

export default SendTestEmailPage;

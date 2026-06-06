'use client';
import { useState } from 'react';
import ChatMessages from './ChatMessages';
import ChatInputBar from './ChatInputBar';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg = { role: 'user' as const, content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    
    // Add empty assistant message to stream into (or fill later)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = typeof errorData.error === 'string' ? errorData.error : (errorData.error?.message || 'Failed to get response');
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `❌ خطأ: ${errorMsg}`
          };
          return updated;
        });
        return;
      }

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: data.reply
          };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '28px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F97316, #EA7208)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(249,115,22,0.5)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.7)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(249,115,22,0.5)';
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '28px',
          width: '380px',
          height: '520px',
          background: '#0F1624',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease',
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Chat Header */}
          <div style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #F97316, #EA7208)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>🤖</div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>
                المساعد الذكي
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                متصل الآن
              </div>
            </div>
            <div style={{
              marginRight: 'auto',
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 6px #4ade80'
            }}/>
          </div>

          <ChatMessages messages={messages} />
          <ChatInputBar onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}
    </>
  );
}

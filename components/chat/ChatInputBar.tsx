'use client';
import { useState } from 'react';

export default function ChatInputBar({ onSend, isLoading }: { onSend: (text: string) => void, isLoading: boolean }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', gap: '8px', alignItems: 'center'
    }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="اكتب سؤالك التقني..."
        style={{
          flex: 1,
          background: '#161E30',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: '#F1F5F9',
          fontSize: '13px',
          outline: 'none',
          fontFamily: 'inherit',
          textAlign: 'right'
        }}
      />
      <button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        style={{
          width: '40px', height: '40px',
          borderRadius: '12px',
          background: isLoading ? '#374151' : 'linear-gradient(135deg,#F97316,#EA7208)',
          border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0
        }}
      >
        {isLoading ? (
          <div style={{
            width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}/>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

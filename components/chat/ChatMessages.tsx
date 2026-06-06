'use client';
import { useEffect, useRef } from 'react';

export default function ChatMessages({ messages }: { messages: any[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}>
      {messages.length === 0 && (
        <div style={{ textAlign: 'center', color: '#475569', marginTop: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
          <div style={{ fontSize: '13px', fontFamily: 'inherit' }}>
            اسألني أي سؤال تقني
          </div>
          <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
            Instrumentation • Électricité • Automatisme
          </div>
        </div>
      )}
      {messages.map((msg, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
          gap: '8px'
        }}>
          <div style={{
            maxWidth: '80%',
            padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: msg.role === 'user' ? '#161E30' : 'linear-gradient(135deg,#F97316,#EA7208)',
            color: 'white',
            fontSize: '13px',
            lineHeight: 1.6,
            border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.07)' : 'none',
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap'
          }}>
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

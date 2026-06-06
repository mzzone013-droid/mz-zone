'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function ChatBot() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: t('welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] })
      });
      
      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      <div className={`chatbot-window glass ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header bg-gradient-to-r from-[var(--surface2)] to-[var(--surface)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_var(--accent-glow)]">
              🤖
            </div>
            <div>
              <div className="font-black text-[14px]">{t('title')}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="text-[10px] text-[var(--text2)] font-bold uppercase tracking-wider">Online Assistance</div>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/5 transition-colors text-[var(--text3)]">✕</button>
        </div>
        
        <div className="chatbot-messages bg-[#070B14]/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'font-bold' : ''}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-msg assistant">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[var(--text3)] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chatbot-input p-4 bg-[var(--surface)] border-t border-[var(--border)]">
          <div className="flex gap-2 bg-[var(--surface2)] p-1.5 rounded-xl border border-[var(--border2)]">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('placeholder')}
              className="flex-1 bg-transparent border-none outline-none px-3 text-[13px] text-white"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="bg-[var(--accent)] text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-lg disabled:opacity-50"
            >
              {locale === 'ar' ? '←' : '→'}
            </button>
          </div>
        </div>
      </div>
      
      <button 
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-orange-600 flex items-center justify-center text-3xl shadow-[0_8px_32px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="animate-bounce-slow">🤖</span>
      </button>
    </div>
  );
}

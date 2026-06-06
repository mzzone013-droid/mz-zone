'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
};

export default function VendorChatPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // جلب قائمة جهات الاتصال
        const { data: msgs } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

        const contactIds = Array.from(new Set((msgs || []).flatMap(m => [m.sender_id, m.receiver_id])))
          .filter(id => id !== user.id);

        if (contactIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', contactIds);
          if (profiles) setConversations(profiles);
        }
      }
      setLoading(false);
    }
    init();

    // الاشتراك في الرسائل الجديدة (Real-time)
    const channel = supabase
      .channel('vendor_realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (selectedUser && currentUser) {
      const fetchMsgs = async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      };
      fetchMsgs();
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (imgUrl?: string) => {
    if ((!inputValue.trim() && !imgUrl) || !selectedUser || !currentUser) return;
    const content = inputValue.trim();
    if (!imgUrl) setInputValue('');

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: content,
      image_url: imgUrl
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      handleSendMessage(publicUrl);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#0F1624', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      
      {/* Sidebar */}
      <div style={{ width: '300px', background: '#161E30', borderRight: isRTL ? 'none' : '1px solid rgba(255,255,255,0.05)', borderLeft: isRTL ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div style={{ padding: '20px', color: 'white', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{isRTL ? 'المحادثات' : 'Conversations'}</div>
        <div style={{ overflowY: 'auto' }}>
          {conversations.map(u => (
            <div key={u.id} onClick={() => setSelectedUser(u)} style={{ padding: '15px 20px', cursor: 'pointer', background: selectedUser?.id === u.id ? 'rgba(249,115,22,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{u.full_name[0]}</div>
               <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{u.full_name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, textAlign: isRTL ? 'right' : 'left' }}>{selectedUser.full_name}</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(m => {
                const isMine = m.sender_id === currentUser.id;
                return (
                  <div key={m.id} style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    background: isMine ? '#F97316' : '#1E293B',
                    padding: '10px 14px', borderRadius: '15px', color: 'white', maxWidth: '70%', fontSize: '14px'
                  }}>
                    {m.image_url && <img src={m.image_url} style={{ width: '100%', borderRadius: '10px', marginBottom: '5px' }} />}
                    {m.content}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
              <label style={{ cursor: 'pointer', fontSize: '20px' }}>📷<input type="file" hidden accept="image/*" onChange={handleImageUpload} /></label>
              <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, background: '#161E30', border: 'none', borderRadius: '10px', padding: '10px', color: 'white', outline: 'none' }} />
              <button onClick={() => handleSendMessage()} style={{ background: '#F97316', border: 'none', color: 'white', padding: '0 15px', borderRadius: '10px' }}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>{isRTL ? 'اختر محادثة للبدء' : 'Select a conversation'}</div>
        )}
      </div>
    </div>
  );
}

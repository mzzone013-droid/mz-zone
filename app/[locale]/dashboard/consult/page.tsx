'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  email: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  created_at: string;
};

export default function UnifiedConsultPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();
  
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [vendors, setVendors] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContacts, setShowContacts] = useState(true); // للهواتف
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [viewedVendor, setViewedVendor] = useState<Profile | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile);
      if (profile?.role === 'vendor') {
        fetchConversations(user.id);
      } else {
        const { data: vds } = await supabase.from('profiles').select('*').eq('role', 'vendor');
        if (vds) setVendors(vds);
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('unified_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          const isRelated = (newMsg.sender_id === selectedUser?.id || newMsg.receiver_id === selectedUser?.id);
          if (isRelated && !prev.find(m => m.id === newMsg.id)) return [...prev, newMsg];
          return prev;
        });
        if (currentUser?.role === 'vendor' && currentUser?.id) fetchConversations(currentUser.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser?.id, currentUser?.id]);

  const fetchConversations = async (uid: string) => {
    const { data: msgs } = await supabase.from('messages').select('sender_id, receiver_id').or(`sender_id.eq.${uid},receiver_id.eq.${uid}`);
    const contactIds = Array.from(new Set((msgs || []).flatMap(m => [m.sender_id, m.receiver_id]))).filter(id => id !== uid);
    if (contactIds.length > 0) {
      const { data: contacts } = await supabase.from('profiles').select('*').in('id', contactIds);
      if (contacts) setConversations(contacts);
    }
  };

  useEffect(() => {
    if (selectedUser && currentUser) {
      const fetchMsgs = async () => {
        const { data } = await supabase.from('messages').select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      };
      fetchMsgs();
      if (window.innerWidth < 900) setShowContacts(false);
    }
  }, [selectedUser?.id, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (imgUrl?: string) => {
    if ((!inputValue.trim() && !imgUrl) || !selectedUser || !currentUser) return;
    const content = inputValue.trim();
    if (!imgUrl) setInputValue('');
    await supabase.from('messages').insert({ sender_id: currentUser.id, receiver_id: selectedUser.id, content, image_url: imgUrl });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    const filePath = `${currentUser.id}/${Math.random()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('chat-attachments').upload(filePath, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath);
      handleSendMessage(publicUrl);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>⏳ Loading Chat...</div>;

  if (currentUser?.role === 'vendor') {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 150px)', background: '#0F1624', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', flexDirection: isRTL ? 'row-reverse' : 'row', position: 'relative' }}>
        <style>{`
          @media (max-width: 900px) {
            .chat-sidebar { position: absolute; top: 0; left: 0; width: 100% !important; height: 100%; z-index: 10; display: ${showContacts ? 'block' : 'none'} !important; }
            .chat-main { display: ${showContacts ? 'none' : 'flex'} !important; }
            .back-to-contacts { display: block !important; }
          }
          .back-to-contacts { display: none; }
        `}</style>
        
        {/* Sidebar */}
        <div className="chat-sidebar" style={{ width: '300px', background: '#161E30', borderRight: isRTL ? 'none' : '1px solid rgba(255,255,255,0.05)', borderLeft: isRTL ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <div style={{ padding: '20px', color: 'white', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{isRTL ? 'الرسائل الواردة' : 'Messages'}</div>
          <div style={{ overflowY: 'auto' }}>
            {conversations.map(c => (
              <div key={c.id} onClick={() => setSelectedUser(c)} style={{ padding: '15px 20px', cursor: 'pointer', background: selectedUser?.id === c.id ? 'rgba(249,115,22,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0F1624', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 800 }}>{c.full_name[0]}</span>}
                </div>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{c.full_name}</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>{isRTL ? 'زبون' : 'Customer'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Main */}
        <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              <div style={{ padding: '15px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <button className="back-to-contacts" onClick={() => setShowContacts(true)} style={{ background: 'none', border: 'none', color: '#F97316', fontSize: '18px' }}>{isRTL ? '→' : '←'}</button>
                <span>{selectedUser.full_name}</span>
                <div style={{ width: '20px' }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map(m => (
                  <div key={m.id} style={{ alignSelf: m.sender_id === currentUser?.id ? 'flex-end' : 'flex-start', background: m.sender_id === currentUser?.id ? '#F97316' : '#1E293B', padding: '10px 16px', borderRadius: '18px', color: 'white', maxWidth: '85%' }}>
                    {m.image_url && <img src={m.image_url} style={{ width: '100%', borderRadius: '10px', marginBottom: '5px' }} />}
                    <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{m.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                <label style={{ cursor: 'pointer', fontSize: '20px' }}>📷<input type="file" hidden onChange={handleImageUpload} /></label>
                <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, background: '#161E30', border: 'none', borderRadius: '12px', padding: '10px 15px', color: 'white', outline: 'none', fontSize: '14px' }} placeholder={isRTL ? 'اكتب ردك...' : 'Type a reply...'} />
                <button onClick={() => handleSendMessage()} style={{ width: '40px', height: '40px', background: '#F97316', border: 'none', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>➤</button>
              </div>
            </>
          ) : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>{isRTL ? 'اختر محادثة للبدء' : 'Select a chat'}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'white', marginBottom: '30px', textAlign: isRTL ? 'right' : 'left', fontSize: '24px' }}>{isRTL ? 'استشارة الخبراء' : 'Expert Consultations'}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {vendors.map(v => (
          <div key={v.id} onClick={() => setViewedVendor(v)} style={{ background: '#0F1624', borderRadius: '20px', padding: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#161E30', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.avatar_url ? <img src={v.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#F97316', fontSize: '24px', fontWeight: 800 }}>{v.full_name[0]}</span>}
                </div>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{v.full_name}</div>
                  <div style={{ color: '#10B981', fontSize: '11px' }}>🟢 {isRTL ? 'متاح للاستشارة' : 'Available'}</div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Vendor Profile Modal */}
      {viewedVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#0F1624', width: '100%', maxWidth: '400px', borderRadius: '30px', padding: '30px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
             <button onClick={() => setViewedVendor(null)} style={{ position: 'absolute', top: '20px', [isRTL ? 'left' : 'right']: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
             
             <div style={{ width: '120px', height: '120px', borderRadius: '30px', background: '#161E30', margin: '0 auto 20px', overflow: 'hidden', border: '3px solid #F97316' }}>
                {viewedVendor.avatar_url ? <img src={viewedVendor.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '40px', lineHeight: '120px' }}>👤</span>}
             </div>
             
             <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '5px' }}>{viewedVendor.full_name}</h2>
             <p style={{ color: '#F97316', fontWeight: 600, fontSize: '14px', marginBottom: '15px' }}>{isRTL ? 'خبير معتمد في MZ-Zone' : 'Certified MZ-Zone Expert'}</p>
             
             {/* Rating Stars - Empty by default */}
             <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '25px' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ fontSize: '24px', color: '#334155', cursor: 'pointer' }}>☆</span>
                ))}
             </div>

             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', marginBottom: '25px', textAlign: isRTL ? 'right' : 'left' }}>
                <div style={{ color: '#94A3B8', fontSize: '12px' }}>📧 {isRTL ? 'البريد الإلكتروني' : 'Email'}</div>
                <div style={{ color: 'white', fontSize: '14px' }}>{viewedVendor.email}</div>
             </div>

             <button 
              onClick={() => { setSelectedUser(viewedVendor); setViewedVendor(null); }}
              style={{ width: '100%', padding: '16px', borderRadius: '15px', background: '#F97316', color: 'white', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(249,115,22,0.3)' }}
             >
                {isRTL ? 'طلب استشارة فورية' : 'Request Consultation'}
             </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <style>{`
            @media (max-width: 600px) { .chat-modal { height: 100% !important; width: 100% !important; border-radius: 0 !important; } }
          `}</style>
          <div className="chat-modal" style={{ background: '#0F1624', width: '100%', maxWidth: '500px', height: '80vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', fontWeight: 700, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ width: '35px', height: '35px', borderRadius: '50%', overflow: 'hidden', background: '#161E30' }}>
                  {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ padding: '5px' }}>👤</span>}
                </div>
                <span>{selectedUser.full_name}</span>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_id === currentUser?.id ? 'flex-end' : 'flex-start', background: m.sender_id === currentUser?.id ? '#F97316' : '#1E293B', padding: '10px 14px', borderRadius: '18px', color: 'white', maxWidth: '85%' }}>
                  {m.image_url && <img src={m.image_url} style={{ width: '100%', borderRadius: '10px', marginBottom: '5px' }} />}
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{m.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', fontSize: '20px' }}>📷<input type="file" hidden onChange={handleImageUpload} /></label>
              <input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, background: '#161E30', border: 'none', borderRadius: '12px', padding: '10px 15px', color: 'white', outline: 'none', fontSize: '14px' }} placeholder={isRTL ? 'اكتب رسالتك...' : 'Type...'} />
              <button onClick={() => handleSendMessage()} style={{ width: '40px', height: '40px', background: '#F97316', border: 'none', color: 'white', borderRadius: '10px' }}>➤</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    avatar_url: ''
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        avatar_url: profile.avatar_url,
      })
      .eq('id', userId);

    if (error) {
      console.error('Save error:', error);
      alert(error.message);
    } else {
      alert(isRTL ? 'تم حفظ التعديلات بنجاح!' : 'Profile saved successfully!');
      router.refresh();
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;

    // Upload image to storage bucket 'avatars'
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    
    if (uploadError) {
      alert(isRTL ? 'فشل رفع الصورة (تأكد من وجود bucket باسم avatars)' : 'Failed to upload image.');
      setSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setProfile({ ...profile, avatar_url: publicUrl });
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      isRTL 
      ? 'هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء!' 
      : 'Are you sure you want to delete your account? This cannot be undone!'
    );

    if (confirmDelete) {
      // In Supabase, deleting a user securely usually requires Edge Functions or Admin API.
      // For this frontend, we will delete their profile data and sign them out.
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.auth.signOut();
      router.push(`/${locale}/login`);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>⏳ Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', textAlign: isRTL ? 'right' : 'left', marginBottom: '40px', fontSize: '32px' }}>
        {isRTL ? 'الملف الشخصي' : 'User Profile'}
      </h1>

      <div style={{ background: '#0F1624', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)' }}>
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: '#161E30', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '40px', color: 'white' }}>{profile.full_name?.[0] || '👤'}</span>
            )}
            <label style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '12px', textAlign: 'center', padding: '6px 0', cursor: 'pointer', fontWeight: 600 }}>
              {isRTL ? 'تغيير الصورة' : 'Change'}
              <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', marginBottom: '8px', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>{isRTL ? 'الاسم واللقب' : 'Full Name'}</label>
            <input 
              value={profile.full_name} 
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              style={{ width: '100%', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '14px 16px', borderRadius: '12px', outline: 'none', textAlign: isRTL ? 'right' : 'left' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94A3B8', marginBottom: '8px', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
            <input 
              value={profile.phone} 
              onChange={e => setProfile({...profile, phone: e.target.value})}
              placeholder="0555..."
              style={{ width: '100%', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '14px 16px', borderRadius: '12px', outline: 'none', textAlign: isRTL ? 'right' : 'left' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94A3B8', marginBottom: '8px', textAlign: isRTL ? 'right' : 'left', fontSize: '13px' }}>{isRTL ? 'العنوان الشخصي' : 'Address'}</label>
            <input 
              value={profile.address} 
              onChange={e => setProfile({...profile, address: e.target.value})}
              placeholder={isRTL ? "الولاية، البلدية..." : "City, State..."}
              style={{ width: '100%', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '14px 16px', borderRadius: '12px', outline: 'none', textAlign: isRTL ? 'right' : 'left' }} 
            />
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ marginTop: '20px', width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
          >
            {saving ? '⏳...' : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}
          </button>
        </div>

        {/* Delete Account */}
        <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#F43F5E', textAlign: isRTL ? 'right' : 'left', fontSize: '18px', marginBottom: '10px' }}>{isRTL ? 'منطقة الخطر' : 'Danger Zone'}</h3>
          <p style={{ color: '#64748B', textAlign: isRTL ? 'right' : 'left', fontSize: '13px', marginBottom: '20px' }}>
            {isRTL ? 'بمجرد حذف حسابك، سيتم مسح جميع بياناتك ولا يمكن استعادتها.' : 'Once you delete your account, there is no going back. Please be certain.'}
          </p>
          <button 
            onClick={handleDeleteAccount}
            style={{ width: '100%', background: 'rgba(244,63,94,0.1)', color: '#F43F5E', border: '1px solid rgba(244,63,94,0.3)', padding: '16px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
          >
            {isRTL ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
          </button>
        </div>

      </div>
    </div>
  );
}

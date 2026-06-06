'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useLocale } from 'next-intl';

export default function LoginPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        // إنشاء حساب جديد
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
            },
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
          }
        });
        if (error) throw error;
        setMessage({ 
          type: 'success', 
          text: isRTL ? 'تم إنشاء الحساب! يرجى تفعيل بريدك الإلكتروني إذا طلب منك ذلك.' : 'Account created! Check your email if verification is required.' 
        });
      } else {
        // تسجيل دخول
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = `/${locale}/dashboard`;
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#161E30',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    textAlign: isRTL ? 'right' : 'left',
    marginBottom: '14px',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#070B14', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#0F1624',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px',
        padding: '40px', textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          {isRegister ? (isRTL ? 'إنشاء حساب جديد' : 'Create Account') : (isRTL ? 'تسجيل الدخول' : 'Sign In')}
        </h1>

        {message && (
          <div style={{
            padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px',
            background: message.type === 'error' ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
            color: message.type === 'error' ? '#F43F5E' : '#10B981',
            border: `1px solid ${message.type === 'error' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailAuth}>
          {isRegister && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" placeholder={isRTL ? 'الاسم' : 'First Name'} 
                style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} required
              />
              <input 
                type="text" placeholder={isRTL ? 'اللقب' : 'Last Name'} 
                style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} required
              />
            </div>
          )}
          
          <input 
            type="email" placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'} 
            style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required
          />
          
          <input 
            type="password" placeholder={isRTL ? 'كلمة المرور' : 'Password'} 
            style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required
          />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: '#F97316', color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px', opacity: loading ? 0.7 : 1
          }}>
            {loading ? '...' : (isRegister ? (isRTL ? 'إنشاء الحساب' : 'Register') : (isRTL ? 'دخول' : 'Login'))}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
          <span style={{ fontSize: '11px', color: '#475569' }}>{isRTL ? 'أو' : 'OR'}</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '12px', background: 'white', color: '#0F172A',
            border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          <img src="https://www.google.com/favicon.ico" width="18" alt="Google" />
          {isRTL ? 'متابعة عبر Google' : 'Continue with Google'}
        </button>

        <p style={{ marginTop: '24px', fontSize: '13px', color: '#94A3B8' }}>
          {isRegister ? (isRTL ? 'لديك حساب؟' : 'Have an account?') : (isRTL ? 'ليس لديك حساب؟' : "No account?")}{' '}
          <span 
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#F97316', cursor: 'pointer', fontWeight: 700 }}
          >
            {isRegister ? (isRTL ? 'سجل دخولك' : 'Sign In') : (isRTL ? 'أنشئ حساباً' : 'Create One')}
          </span>
        </p>
      </div>
    </div>
  );
}

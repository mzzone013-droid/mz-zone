'use client';
import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function TopbarUI({ user, role, avatarUrl, locale, isRTL }: { user: any, role: string | null, avatarUrl?: string | null, locale: string, isRTL: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLabels = isRTL 
    ? ['الرئيسية', 'الموارد', 'الاستشارات', 'طلباتي'] 
    : ['Home', 'Resources', 'Consultations', 'Orders'];

  const navLinks = [
    `/${locale}/dashboard`,
    `/${locale}/dashboard/resources`,
    `/${locale}/dashboard/consult`,
    `/${locale}/dashboard/orders`
  ];

  return (
    <div style={{
      background: 'rgba(15,22,36,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 25px',
      height: '85px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(15px)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .user-info-text { display: none !important; }
        }
        @media (min-width: 901px) {
          .mobile-nav { display: none !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>

      {/* Left side: User & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px', borderRadius: '12px', cursor: 'pointer', color: 'white', fontSize: '20px'
          }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Link href={`/${locale}/dashboard/profile`} style={{ textDecoration: 'none', color: 'inherit' }}>
               <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: '#161E30', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '25px', padding: '5px', cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.background = '#1E293B'} onMouseLeave={e => e.currentTarget.style.background = '#161E30'}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden',
                  background: 'linear-gradient(135deg,#F97316,#FBBF24)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 900, color: 'white'
                }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.email?.[0].toUpperCase()
                  )}
                </div>
                <span className="user-info-text" style={{ fontSize: '15px', fontWeight: 600, paddingRight: '15px' }}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
             </Link>
            
            <button 
              className="desktop-nav"
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              style={{
                padding: '10px 18px', border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '12px', background: 'rgba(244,63,94,0.05)',
                color: '#F43F5E', fontSize: '14px', cursor: 'pointer', fontWeight: 700
              }}
            >
              {isRTL ? 'خروج' : 'Logout'}
            </button>
          </div>
        ) : (
          <Link href={`/${locale}/login`} style={{ textDecoration: 'none', color: '#F97316', fontWeight: 700, fontSize: '16px' }}>{isRTL ? 'دخول' : 'Login'}</Link>
        )}
      </div>

      {/* Desktop Navigation (Center) */}
      <nav className="desktop-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {navLabels.map((label, i) => (
          <Link key={label} href={navLinks[i]} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 20px', border: 'none', background: 'transparent',
              color: '#94A3B8', fontSize: '16px', cursor: 'pointer',
              borderRadius: '12px', fontWeight: 700, transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
              {label}
            </button>
          </Link>
        ))}
        {role === 'admin' && (
          <Link href={`/${locale}/admin`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 20px', border: '1px solid rgba(249,115,22,0.35)',
              background: 'rgba(249,115,22,0.1)', color: '#F97316',
              fontSize: '16px', cursor: 'pointer', borderRadius: '12px',
              fontWeight: 700, transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.2)'; e.currentTarget.style.borderColor = '#F97316'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; }}>
              {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
            </button>
          </Link>
        )}
      </nav>

      {/* Logo (Right) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '6px' }} className="desktop-nav">
          {['AR', 'FR', 'EN'].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}/dashboard`} style={{
              fontSize: '11px', color: locale.toUpperCase() === l ? '#F97316' : '#475569',
              textDecoration: 'none', fontWeight: 900, padding: '5px 8px'
            }}>{l}</Link>
          ))}
        </div>
        <Link href={`/${locale}/dashboard`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '12px' }}>
           <div style={{ width: '55px', height: '55px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 0 15px rgba(0,0,0,0.3)' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           </div>
           <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '1px' }} className="desktop-nav">MZ<span style={{ color: '#F97316' }}>-</span>ZONE</div>
        </Link>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="mobile-nav" style={{
          position: 'fixed', top: '70px', left: 0, width: '100%', height: 'calc(100vh - 70px)',
          background: '#070B14', zIndex: 2000, padding: '30px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: '20px', textAlign: isRTL ? 'right' : 'left'
        }}>
           {navLabels.map((label, i) => (
             <Link key={label} href={navLinks[i]} onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none', color: 'white', fontSize: '20px', fontWeight: 700, padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               {label}
             </Link>
           ))}
           {role === 'admin' && (
             <Link href={`/${locale}/admin`} onClick={() => setIsMenuOpen(false)} style={{
               textDecoration: 'none', color: '#F97316', fontSize: '20px', fontWeight: 700,
               padding: '15px 0', borderBottom: '1px solid rgba(249,115,22,0.2)',
               display: 'flex', alignItems: 'center', gap: '10px'
             }}>
               <span>⚙️</span>
               {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
             </Link>
           )}
           <div style={{ marginTop: 'auto', display: 'flex', gap: '20px', paddingBottom: '40px' }}>
             {['AR', 'FR', 'EN'].map(l => (
               <Link key={l} href={`/${l.toLowerCase()}/dashboard`} style={{ color: '#F97316', fontSize: '18px', fontWeight: 800, textDecoration: 'none' }}>{l}</Link>
             ))}
             <button onClick={() => signOut()} style={{ marginLeft: isRTL ? '0' : 'auto', marginRight: isRTL ? 'auto' : '0', background: '#F43F5E', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}>خروج</button>
           </div>
        </div>
      )}
    </div>
  );
}

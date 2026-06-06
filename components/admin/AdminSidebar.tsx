'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const menuItems = [
    { id: 'overview', label_ar: 'نظرة عامة', label_en: 'Overview', icon: '📊', path: `/${locale}/admin` },
    { id: 'vendors', label_ar: 'الموردين', label_en: 'Vendors', icon: '🏭', path: `/${locale}/admin/vendors` },
    { id: 'products', label_ar: 'المنتجات', label_en: 'Products', icon: '📦', path: `/${locale}/admin/products` },
    { id: 'orders', label_ar: 'الطلبات', label_en: 'Orders', icon: '🛒', path: `/${locale}/admin/orders` },
    { id: 'users', label_ar: 'المستخدمين', label_en: 'Users', icon: '👥', path: `/${locale}/admin/users` },
  ];

  return (
    <div style={{
      width: '260px', height: '100vh', background: '#0F1624',
      borderLeft: isRTL ? '1px solid rgba(255,255,255,0.07)' : 'none',
      borderRight: !isRTL ? '1px solid rgba(255,255,255,0.07)' : 'none',
      padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
      position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, zIndex: 300
    }}>
      {/* Admin Branding */}
      <div style={{ padding: '0 12px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', color: '#F97316', fontWeight: 800, letterSpacing: '1px' }}>CONTROL PANEL</div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>MZ ADMIN</div>
      </div>

      {menuItems.map(item => (
        <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
            background: pathname === item.path ? 'rgba(249,115,22,0.1)' : 'transparent',
            color: pathname === item.path ? '#F97316' : '#94A3B8',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{isRTL ? item.label_ar : item.label_en}</span>
          </div>
        </Link>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px' }}>
        <Link href={`/${locale}/dashboard`} style={{
          fontSize: '13px', color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <span>🏠</span>
          <span>{isRTL ? 'العودة للمنصة' : 'Back to Store'}</span>
        </Link>
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VendorSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const menuItems = [
    { id: 'overview', label_ar: 'الرئيسية', label_en: 'Home', icon: '📊', path: `/${locale}/vendor` },
    { id: 'products', label_ar: 'منتجاتي', label_en: 'Products', icon: '📦', path: `/${locale}/vendor/products` },
    { id: 'add-product', label_ar: 'إضافة', label_en: 'Add', icon: '➕', path: `/${locale}/vendor/products/new` },
    { id: 'orders', label_ar: 'الطلبات', label_en: 'Orders', icon: '🛒', path: `/${locale}/vendor/orders` },
    { id: 'consult', label_ar: 'الرسائل', label_en: 'Chat', icon: '💬', path: `/${locale}/vendor/consult` },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .vendor-sidebar {
            width: 100% !important;
            height: 70px !important;
            flex-direction: row !important;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            padding: 0 10px !important;
            justify-content: space-around !important;
            border-top: 1px solid rgba(255,255,255,0.07) !important;
            border-left: none !important;
            border-right: none !important;
          }
          .vendor-sidebar-header, .back-to-store { display: none !important; }
          .vendor-menu-item { flex-direction: column !important; gap: 4px !important; padding: 10px !important; flex: 1 !important; justify-content: center !important; }
          .vendor-menu-item span:last-child { fontSize: 10px !important; }
        }
      `}</style>

      <div className="vendor-sidebar" style={{
        width: '260px', height: '100vh', background: '#0F1624',
        borderLeft: isRTL ? '1px solid rgba(255,255,255,0.07)' : 'none',
        borderRight: !isRTL ? '1px solid rgba(255,255,255,0.07)' : 'none',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px',
        position: 'fixed', top: 0, [isRTL ? 'right' : 'left']: 0, zIndex: 300
      }}>
        <div className="vendor-sidebar-header" style={{ padding: '0 12px 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, letterSpacing: '1px' }}>VENDOR HUB</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>MZ VENDOR</div>
        </div>

        {menuItems.map(item => (
          <Link key={item.id} href={item.path} style={{ textDecoration: 'none', flex: 1, display: 'flex' }}>
            <div className="vendor-menu-item" style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', width: '100%',
              background: pathname === item.path ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: pathname === item.path ? '#10B981' : '#94A3B8',
              flexDirection: isRTL ? 'row-reverse' : 'row'
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{isRTL ? item.label_ar : item.label_en}</span>
            </div>
          </Link>
        ))}

        <div className="back-to-store" style={{ marginTop: 'auto', padding: '12px' }}>
          <Link href={`/${locale}/dashboard`} style={{
            fontSize: '13px', color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <span>🏠</span>
            <span>{isRTL ? 'العودة للمنصة' : 'Back to Store'}</span>
          </Link>
        </div>
      </div>
    </>
  );
}

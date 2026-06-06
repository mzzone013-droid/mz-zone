'use client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useLocale } from 'next-intl';
import { use } from 'react';

export default function AdminLayout({
  children,
  params: paramsPromise
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = use(paramsPromise);
  const locale = params.locale;
  const isRTL = locale === 'ar';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070B14', color: '#F1F5F9' }}>
      <AdminSidebar locale={locale} />
      <main style={{
        flex: 1,
        marginRight: isRTL ? '260px' : '0',
        marginLeft: !isRTL ? '260px' : '0',
        padding: '40px',
        width: '100%'
      }}>
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: '40px', flexDirection: isRTL ? 'row-reverse' : 'row' 
        }}>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>SYSTEM ADMIN</div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>DASHBOARD CONTROL</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#161E30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
             <div style={{ padding: '8px 16px', borderRadius: '10px', background: '#F97316', color: 'white', fontWeight: 700, fontSize: '13px' }}>
                {isRTL ? 'تحديث النظام' : 'Update System'}
             </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

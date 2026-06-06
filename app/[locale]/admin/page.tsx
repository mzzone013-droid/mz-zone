import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  const [
    { count: totalVendors },
    { count: pendingVendors },
    { count: totalProducts },
    { count: todayOrders },
  ] = await Promise.all([
    supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('vendor_products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
  ]);

  const adminStats = [
    { label_ar: 'إجمالي الموردين',   label_en: 'Total Vendors',   val: totalVendors ?? 0,   icon: '🏢', color: '#3B82F6' },
    { label_ar: 'بانتظار الموافقة', label_en: 'Pending Vendors',  val: pendingVendors ?? 0, icon: '⏳', color: '#F59E0B' },
    { label_ar: 'المنتجات النشطة',  label_en: 'Active Products',  val: totalProducts ?? 0,  icon: '📦', color: '#10B981' },
    { label_ar: 'طلبات اليوم',      label_en: 'Orders Today',     val: todayOrders ?? 0,    icon: '🛒', color: '#F97316' },
  ];

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px'
      }}>
        {adminStats.map((stat, i) => (
          <div key={i} style={{
            background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px',
            padding: '24px', textAlign: isRTL ? 'right' : 'left'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px'
            }}>{stat.icon}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
              {isRTL ? stat.label_ar : stat.label_en}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px',
        padding: '30px', textAlign: isRTL ? 'right' : 'left'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
          {isRTL ? 'تنبيهات النظام الأخيرة' : 'Recent System Alerts'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {[1, 2, 3].map(item => (
             <div key={item} style={{
                padding: '16px', background: '#161E30', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isRTL ? 'row-reverse' : 'row'
             }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316' }}></div>
                <div style={{ flex: 1, fontSize: '14px', color: '#94A3B8' }}>
                   {isRTL ? 'هناك مورد جديد في انتظار المراجعة والقبول.' : 'A new vendor is waiting for review and approval.'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>2m ago</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

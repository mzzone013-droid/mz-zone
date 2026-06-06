import { supabaseAdmin } from '@/lib/supabase-admin';
import OrderActions from '@/components/admin/OrderActions';

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  // جلب الطلبات من Supabase مع معلومات المورد إن أمكن
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      vendors ( company_name )
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
         <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{isRTL ? 'إدارة كافة الطلبات' : 'All Orders Management'}</h2>
         <button style={{
            padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', color: '#EF4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
         }}>
            {isRTL ? 'حذف كافة الطلبات الوهمية' : 'Clean All Fake Orders'}
         </button>
      </div>

      <div style={{ background: '#0F1624', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'معرف الطلب' : 'Order ID'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'المنتج' : 'Product'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'المورد' : 'Vendor'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'المبلغ' : 'Amount'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'الحالة' : 'Status'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                  {isRTL ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
                </td>
              </tr>
            ) : orders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '16px 24px', fontSize: '12px', color: '#94A3B8' }}>{order.id.slice(0, 8)}...</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>
                  {order.product_emoji} {order.product_name}
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'normal' }}>Qty: {order.quantity}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94A3B8' }}>
                  {order.vendors?.company_name || order.supplier || 'N/A'}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 800 }}>{order.total_price?.toLocaleString()} DZD</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                    background: order.status === 'completed' ? 'rgba(16,185,129,0.1)' : order.status === 'fake' || order.is_flagged ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: order.status === 'completed' ? '#10B981' : order.status === 'fake' || order.is_flagged ? '#EF4444' : '#F59E0B',
                    border: `1px solid ${order.status === 'completed' ? 'rgba(16,185,129,0.2)' : order.status === 'fake' || order.is_flagged ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                  }}>
                    {isRTL ? (order.status === 'completed' ? 'مكتمل' : order.status === 'fake' || order.is_flagged ? 'مشبوه' : 'قيد المعالجة') : (order.is_flagged ? 'flagged' : order.status)}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <OrderActions orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

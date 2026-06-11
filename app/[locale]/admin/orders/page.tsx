import { supabaseAdmin } from '@/lib/supabase-admin';
import OrderActions from '@/components/admin/OrderActions';

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      buyer:profiles!orders_user_id_fkey(full_name, email),
      vendor_info:profiles!orders_vendor_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) console.error('Admin orders query error:', error.message, error.details);

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

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', color: '#EF4444', fontSize: '13px' }}>
          ⚠️ Query error: {error.message}
        </div>
      )}

      <div style={{ background: '#0F1624', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'معرف الطلب' : 'Order ID'}</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B' }}>{isRTL ? 'المشتري' : 'Buyer'}</th>
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
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                  {error
                    ? (isRTL ? 'خطأ في تحميل الطلبات — راجع السجلات' : 'Failed to load orders — check server logs')
                    : (isRTL ? 'لا توجد طلبات حتى الآن' : 'No orders yet')}
                </td>
              </tr>
            ) : (orders as any[]).map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '16px 24px', fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>{order.id.slice(0, 8)}…</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{order.buyer?.full_name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{order.buyer?.email || ''}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>
                  {order.product_emoji} {order.product_name}
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'normal' }}>Qty: {order.quantity}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94A3B8' }}>
                  {order.vendor_info?.full_name || order.supplier || 'N/A'}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 800 }}>{order.total_price?.toLocaleString()} DZD</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                    background: order.status === 'completed' ? 'rgba(16,185,129,0.1)' : order.status === 'fake' || order.is_flagged ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: order.status === 'completed' ? '#10B981' : order.status === 'fake' || order.is_flagged ? '#EF4444' : '#F59E0B',
                    border: `1px solid ${order.status === 'completed' ? 'rgba(16,185,129,0.2)' : order.status === 'fake' || order.is_flagged ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                  }}>
                    {isRTL
                      ? (order.status === 'completed' ? 'مكتمل' : order.is_flagged || order.status === 'fake' ? 'مشبوه' : 'قيد المعالجة')
                      : (order.is_flagged ? 'flagged' : order.status)}
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

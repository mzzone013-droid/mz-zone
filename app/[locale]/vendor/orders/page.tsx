'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase-client';

type Order = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  product: {
    name: string;
    reference: string;
  };
};

export default function VendorOrdersPage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
  const params = use(paramsPromise);
  const { locale } = params;
  const isRTL = locale === 'ar';
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, email),
        product:vendor_products (name, reference)
      `)
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    if (data) setOrders(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>⏳ Loading Orders...</div>;

  return (
    <div>
      <div style={{ marginBottom: '30px', textAlign: isRTL ? 'right' : 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{isRTL ? '📦 طلبات الزبائن' : 'Customer Orders'}</h2>
        <p style={{ color: '#64748B', fontSize: '14px' }}>{isRTL ? 'إدارة طلبات الشراء الواردة من الزبائن.' : 'Manage incoming purchase orders from customers.'}</p>
      </div>

      <div style={{ background: '#0F1624', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '20px 24px', color: '#64748B', fontSize: '13px' }}>{isRTL ? 'الزبون' : 'Customer'}</th>
              <th style={{ padding: '20px 24px', color: '#64748B', fontSize: '13px' }}>{isRTL ? 'المنتج' : 'Product'}</th>
              <th style={{ padding: '20px 24px', color: '#64748B', fontSize: '13px' }}>{isRTL ? 'المبلغ' : 'Total'}</th>
              <th style={{ padding: '20px 24px', color: '#64748B', fontSize: '13px' }}>{isRTL ? 'الحالة' : 'Status'}</th>
              <th style={{ padding: '20px 24px', color: '#64748B', fontSize: '13px' }}>{isRTL ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
                  {isRTL ? 'لا توجد طلبات مستلمة حالياً' : 'No orders received yet'}
                </td>
              </tr>
            ) : orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{order.profiles?.full_name}</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>{order.profiles?.email}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ color: 'white', fontSize: '14px' }}>{order.product?.name}</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>Qty: {order.quantity}</div>
                </td>
                <td style={{ padding: '20px 24px', color: '#10B981', fontWeight: 800 }}>
                  {order.total_price.toLocaleString()} DZD
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                    background: order.status === 'pending' ? 'rgba(245,158,11,0.1)' : order.status === 'processing' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                    color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#3B82F6' : '#10B981'
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(order.id, 'processing')} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'قبول' : 'Accept'}</button>
                        <button onClick={() => handleUpdateStatus(order.id, 'rejected')} style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E', border: '1px solid #F43F5E', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'رفض' : 'Reject'}</button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button onClick={() => handleUpdateStatus(order.id, 'shipped')} style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'تم الشحن' : 'Mark Shipped'}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

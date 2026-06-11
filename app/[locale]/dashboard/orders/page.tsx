'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

type Order = {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  city: string;
  shipping_address: string;
  phone_number: string;
  profiles?: { full_name: string; email: string };
  product: {
    name: string;
    image_url?: string | null;
    emoji?: string | null;
    reference: string;
  };
};

export default function SmartOrdersPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const statusMap: any = {
    pending: { ar: 'بانتظار التأكيد', en: 'Pending', color: '#94A3B8' },
    processing: { ar: 'قيد المعالجة', en: 'Processing', color: '#F59E0B' },
    shipped: { ar: 'تم الشحن', en: 'Shipped', color: '#3B82F6' },
    delivered: { ar: 'تم التسليم', en: 'Delivered', color: '#10B981' },
    rejected: { ar: 'مرفوض', en: 'Rejected', color: '#F43F5E' },
  };

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    setUserRole(profile?.role || 'user');

    let query = supabase.from('orders').select(`
      *,
      buyer:profiles!orders_user_id_fkey(full_name, email),
      product:vendor_products!orders_product_id_fkey(name, image_url, emoji, reference)
    `);

    if (profile?.role === 'vendor') {
      query = query.eq('vendor_id', user.id);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.error(error);
    if (data) setOrders(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>⏳ Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <style>{`
        @media (max-width: 600px) {
          .order-card { padding: 16px !important; }
          .order-header { flexDirection: column !important; align-items: flex-start !important; gap: 12px !important; }
          .order-shipping { flexDirection: column !important; gap: 10px !important; }
          .order-shipping div { width: 100% !important; text-align: ${isRTL ? 'right' : 'left'} !important; }
          .order-shipping .divider { display: none !important; }
          .order-footer { flexDirection: column !important; gap: 15px !important; align-items: stretch !important; }
          .order-footer button { width: 100% !important; }
        }
      `}</style>
      <div style={{ textAlign: isRTL ? 'right' : 'left', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', color: 'white' }}>
          {userRole === 'vendor' 
            ? (isRTL ? '📦 طلبات الزبائن المستلمة' : 'Customer Orders')
            : (isRTL ? '🛍️ مشترياتي' : 'My Purchases')}
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px' }}>
          {userRole === 'vendor'
            ? (isRTL ? 'إدارة ومعالجة طلبات الشراء الواردة من زبائن المنصة.' : 'Manage and process incoming orders from customers.')
            : (isRTL ? 'متابعة حالة الطلبات التي قمت بشرائها.' : 'Track the status of your purchases.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '80px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: '#0F1624', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: 'white' }}>{isRTL ? 'لا توجد طلبات حالياً' : 'No orders yet'}</h3>
          </div>
        ) : orders.map(order => (
          <div key={order.id} className="order-card" style={{
            background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            {/* Top Row: Product Info */}
            <div className="order-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '15px', background: '#161E30', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {order.product?.image_url ? <img src={order.product.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📦</span>}
              </div>
              <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>{order.product?.name}</div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>{new Date(order.created_at).toLocaleDateString()} • Qty: {order.quantity}</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981' }}>{order.total_price.toLocaleString()} DZD</div>
            </div>

            {/* Middle Row: Shipping Info (Only shown if data exists) */}
            {(order.city || order.phone_number) && (
              <div className="order-shipping" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px dotted rgba(255,255,255,0.1)', display: 'flex', gap: '20px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                 <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>📍 {isRTL ? 'عنوان التوصيل' : 'Shipping Address'}</div>
                    <div style={{ color: '#F1F5F9', fontSize: '13px', fontWeight: 600 }}>{order.city} - {order.shipping_address}</div>
                 </div>
                 <div className="divider" style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                 <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>📞 {isRTL ? 'رقم الهاتف' : 'Phone'}</div>
                    <div style={{ color: '#F1F5F9', fontSize: '13px', fontWeight: 600 }}>{order.phone_number}</div>
                    {userRole === 'vendor' && <div style={{ fontSize: '11px', color: '#F97316' }}>{isRTL ? `الزبون: ${order.buyer?.full_name}` : `Customer: ${order.buyer?.full_name}`}</div>}
                 </div>
              </div>
            )}

            {/* Bottom Row: Status & Actions */}
            <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{
                padding: '6px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                background: `${(statusMap[order.status] || statusMap.pending).color}15`,
                color: (statusMap[order.status] || statusMap.pending).color,
                border: `1px solid ${(statusMap[order.status] || statusMap.pending).color}30`
              }}>
                {(statusMap[order.status] || statusMap.pending)[isRTL ? 'ar' : 'en']}
              </span>

              {userRole === 'vendor' && order.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleUpdateStatus(order.id, 'processing')} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'قبول ومعالجة' : 'Accept & Process'}</button>
                  <button onClick={() => handleUpdateStatus(order.id, 'rejected')} style={{ background: 'transparent', color: '#F43F5E', border: '1px solid #F43F5E', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'رفض' : 'Reject'}</button>
                </div>
              )}

              {userRole === 'vendor' && order.status === 'processing' && (
                <button onClick={() => handleUpdateStatus(order.id, 'shipped')} style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'تأكيد الشحن' : 'Mark as Shipped'}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

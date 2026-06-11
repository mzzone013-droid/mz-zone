import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AddProductModal from '@/components/admin/AddProductModal';
import ProductDeleteButton from '@/components/admin/ProductDeleteButton';

export default async function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    return <div style={{ color: 'white', padding: '40px' }}>Access Denied</div>;
  }

  const { data: products, error } = await supabaseAdmin
    .from('vendor_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Error:', error);

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{isRTL ? 'إدارة المنتجات' : 'Products Management'}</h2>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{products?.length || 0} {isRTL ? 'منتج إجمالي' : 'Total Products'}</div>
        </div>
        <AddProductModal locale={locale} />
      </div>

      {products && products.length > 0 ? (
        <div style={{ background: '#0F1624', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: '#161E30', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'المنتج' : 'Product'}</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'التصنيف' : 'Category'}</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'السعر' : 'Price'}</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'الكمية' : 'Qty'}</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'الحالة' : 'Status'}</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', color: '#64748B' }}>{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <div style={{ width: '40px', height: '40px', background: '#161E30', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>{p.emoji || '📦'}</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>Ref: {p.reference || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94A3B8' }}>{p.subcat_name || p.specialty || '—'}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 700, color: '#10B981' }}>{p.price} <span style={{ fontSize: '10px' }}>DZD</span></td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'white' }}>{p.quantity ?? 0}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                      background: p.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                      color: p.status === 'active' ? '#10B981' : '#F43F5E',
                    }}>{p.status?.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <ProductDeleteButton productId={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#0F1624', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{isRTL ? 'لا توجد منتجات' : 'No Products'}</h3>
          <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px' }}>{isRTL ? 'لم يتم رفع أي منتجات بعد في النظام.' : 'No products have been uploaded yet.'}</p>
          <AddProductModal locale={locale} />
        </div>
      )}
    </div>
  );
}

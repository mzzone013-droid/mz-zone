'use client';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useMemo, use, useEffect } from 'react';
import Link from 'next/link';
import { SPECIALTIES_DATA, SpecialtyKey } from '@/lib/data';
import { createClient } from '@/lib/supabase-client';

export default function ProductSubcatPage({ params: paramsPromise }: { params: Promise<{ locale: string, subcat: string }> }) {
  const params = use(paramsPromise);
  const { subcat, locale } = params;
  const searchParams = useSearchParams();
  const specialtyId = (searchParams.get('specialty') as SpecialtyKey) || 'instrumentation';
  const isRTL = locale === 'ar';
  const supabase = createClient();
  
  const spec = SPECIALTIES_DATA[specialtyId];
  const subcatInfo = spec?.subcats.find(s => s.id === subcat);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shippingInfo, setShippingInfo] = useState({ city: '', address: '', phone: '' });
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('vendor_products')
        .select('*')
        .eq('subcat_id', subcat)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error:', error);
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [subcat]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (p.reference || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleQtyChange = (id: string, val: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const openCheckout = (product: any) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleConfirmOrder = async () => {
    if (!shippingInfo.city || !shippingInfo.address || !shippingInfo.phone) {
      alert(isRTL ? 'يرجى ملء كافة بيانات التوصيل' : 'Please fill all shipping info');
      return;
    }

    setBuying(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      setBuying(false);
      return;
    }

    const qty = quantities[selectedProduct.id] || 1;
    const totalPrice = selectedProduct.price * qty;

    const { error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        vendor_id: selectedProduct.user_id, // التصحيح هنا: استخدام user_id من جدول المنتجات
        quantity: qty,
        total_price: totalPrice,
        status: 'pending',
        city: shippingInfo.city,
        shipping_address: shippingInfo.address,
        phone_number: shippingInfo.phone
      });

    if (error) {
      console.error(error);
      alert(isRTL ? 'حدث خطأ أثناء إتمام الطلب' : 'Error placing order');
    } else {
      alert(isRTL ? 'تم تقديم طلبك بنجاح! سيتم التواصل معك قريباً.' : 'Order placed successfully!');
      setShowCheckout(false);
      setShippingInfo({ city: '', address: '', phone: '' });
    }
    setBuying(false);
  };

  const getSubcatName = () => {
    if (!subcatInfo) return subcat;
    if (isRTL) return subcatInfo.name_ar;
    if (locale === 'fr') return (subcatInfo as any).name_fr || subcatInfo.name_en;
    return subcatInfo.name_en;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px', color: '#64748B', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <Link href={`/${locale}/dashboard`} style={{ color: 'inherit', textDecoration: 'none' }}>{isRTL ? 'الرئيسية' : 'Home'}</Link>
        <span>/</span>
        <Link href={`/${locale}/dashboard/specialty/${specialtyId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{isRTL ? spec?.title_ar : spec?.title_en}</Link>
        <span>/</span>
        <span style={{ color: 'white', fontWeight: 600 }}>{getSubcatName()}</span>
      </div>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <input 
          type="text" 
          placeholder={isRTL ? 'بحث عن منتج أو رقم مرجعي...' : 'Search...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '14px 20px', background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px',
            color: 'white', fontSize: '14px', outline: 'none', textAlign: isRTL ? 'right' : 'left'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: '#475569' }}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#475569' }}>{isRTL ? 'لا توجد منتجات' : 'No products'}</div>
          ) : filteredProducts.map(p => (
            <div key={p.id} style={{
              background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px', textAlign: isRTL ? 'right' : 'left'
            }}>
              <div style={{ display: 'flex', gap: '20px', flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: '16px' }}>
                <div style={{ width: '80px', height: '80px', background: '#161E30', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.image_url ? <img src={p.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:'32px'}}>{p.emoji || '📦'}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Ref: {p.reference}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981' }}>{p.price} DZD</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161E30', padding: '4px', borderRadius: '8px' }}>
                  <button onClick={() => handleQtyChange(p.id, (quantities[p.id] || 1) - 1)} style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{quantities[p.id] || 1}</span>
                  <button onClick={() => handleQtyChange(p.id, (quantities[p.id] || 1) + 1)} style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <button 
                onClick={() => openCheckout(p)}
                style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#F97316', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isRTL ? 'شراء الآن' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0F1624', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <h2 style={{ color: 'white', marginBottom: '24px', textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'تأكيد طلب الشراء' : 'Confirm Order'}</h2>
             
             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{selectedProduct.name}</div>
                <div style={{ color: '#10B981', fontWeight: 900, fontSize: '18px', marginTop: '4px' }}>
                  {(selectedProduct.price * (quantities[selectedProduct.id] || 1)).toLocaleString()} DZD
                </div>
                <div style={{ color: '#64748B', fontSize: '12px' }}>{isRTL ? `الكمية: ${quantities[selectedProduct.id] || 1}` : `Qty: ${quantities[selectedProduct.id] || 1}`}</div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  placeholder={isRTL ? 'الولاية / المدينة' : 'City / State'} 
                  value={shippingInfo.city} 
                  onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', textAlign: isRTL ? 'right' : 'left' }}
                />
                <input 
                  placeholder={isRTL ? 'العنوان بالتفصيل' : 'Detailed Address'} 
                  value={shippingInfo.address} 
                  onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', textAlign: isRTL ? 'right' : 'left' }}
                />
                <input 
                  placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'} 
                  value={shippingInfo.phone} 
                  onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
                  style={{ width: '100%', padding: '12px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'white', textAlign: isRTL ? 'right' : 'left' }}
                />
             </div>

             <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
                <button 
                  onClick={handleConfirmOrder} 
                  disabled={buying}
                  style={{ flex: 1, padding: '14px', background: '#F97316', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {buying ? (isRTL ? 'جاري التأكيد...' : 'Confirming...') : (isRTL ? 'تأكيد الشراء' : 'Confirm Purchase')}
                </button>
                <button 
                  onClick={() => setShowCheckout(false)} 
                  style={{ flex: 1, padding: '14px', background: 'transparent', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

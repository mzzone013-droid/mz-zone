'use client';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

export default function DashboardHome() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const supabase = createClient();

  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shippingInfo, setShippingInfo] = useState({ city: '', address: '', phone: '' });
  const [buying, setBuying] = useState(false);

  const specialties = [
    { key:'instrumentation', icon:'🎛️', title: isRTL ? 'الأدواتية والقياس' : 'Instrumentation', sub:'Instrumentation', color:'#06B6D4', tags: isRTL ? ['قياس الضغط','قياس التدفق','المستوى','الحرارة'] : ['Pressure','Flow','Level','Temp'] },
    { key:'electrical',      icon:'⚡', title: isRTL ? 'الكهرباء الصناعية' : 'Industrial Electricity', sub:'Électricité Industrielle', color:'#F59E0B', tags: isRTL ? ['أجهزة الحماية','التحكم','المحركات'] : ['Protection','Control','Motors'] },
    { key:'automation',      icon:'🤖', title: isRTL ? 'الأتمتة والتحكم المبرمج' : 'Automation', sub:'Automatisme', color:'#8B5CF6', tags: isRTL ? ['PLC','HMI','Variateurs','SCADA'] : ['PLC','HMI','VFD','SCADA'] },
    { key:'mechanics',       icon:'⚙️', title: isRTL ? 'الميكانيك' : 'Mechanics', sub:'Mécanique', color:'#10B981', tags: isRTL ? ['المضخات','التزييت','الإحكام'] : ['Pumps','Lubrication','Sealing'] },
    { key:'hydraulics',      icon:'💧', title: isRTL ? 'الهيدروليك والبنوماتيك' : 'Hydraulics & Pneumatics', sub:'Hydraulique & Pneumatique', color:'#3B82F6', tags: isRTL ? ['الأسطوانات','الخراطيم'] : ['Cylinders','Hoses'] },
    { key:'hse',             icon:'🦺', title: isRTL ? 'السلامة والصيانة العامة' : 'Safety', sub:'HSE & Maintenance Générale', color:'#F43F5E', tags: isRTL ? ['معدات الوقاية','أجهزة الكشف'] : ['PPE','Detection'] },
  ];

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from('vendor_products')
        .select(`
          *,
          vendor:profiles!vendor_products_user_id_fkey (full_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (data) setRecentProducts(data);
      setLoading(false);
    }
    fetchRecent();
  }, []);

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

    const productName = selectedProduct?.name;
    if (!productName) {
      alert('product_name is missing — product data: ' + JSON.stringify(selectedProduct));
      setBuying(false);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: selectedProduct.id,
        vendor_id: selectedProduct.user_id,
        product_name: productName,
        product_ref: selectedProduct.reference || null,
        product_emoji: selectedProduct.emoji || null,
        supplier: selectedProduct.vendor?.full_name || null,
        quantity: 1,
        total_price: selectedProduct.price,
        status: 'pending',
        city: shippingInfo.city,
        shipping_address: shippingInfo.address,
        phone_number: shippingInfo.phone,
      });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      alert(isRTL ? 'تم تقديم طلبك بنجاح! سيتم التواصل معك قريباً.' : 'Order placed successfully!');
      setShowCheckout(false);
      setShippingInfo({ city: '', address: '', phone: '' });
    }
    setBuying(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {/* Welcome Header */}
      <div style={{ textAlign: isRTL ? 'right' : 'left', marginBottom: '48px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #F97316' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', margin: 0 }}>
            {isRTL ? 'مرحباً في MZ-Zone' : 'Welcome to MZ-Zone'}
          </h1>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '16px', maxWidth: '600px', marginLeft: isRTL ? 'auto' : '0' }}>
          {isRTL ? 'المنصة الصناعية المتكاملة لتوفير الحلول الهندسية والمعدات التقنية' : 'The integrated industrial platform for engineering solutions and technical equipment'}
        </p>
      </div>

      {/* Specialties Section */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '32px',
        flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>{isRTL ? 'التخصصات الصناعية' : 'Industrial Specialties'}</h2>
        <div style={{ width: '5px', height: '28px', background: 'linear-gradient(to bottom, #F97316, #FB923C)', borderRadius: '10px' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '80px' }}>
        {specialties.map(spec => (
          <Link key={spec.key} href={`/${locale}/dashboard/specialty/${spec.key}`} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '24px',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: isRTL ? 'right' : 'left',
              position: 'relative', overflow: 'hidden'
            }} onMouseEnter={e => {
              e.currentTarget.style.borderColor = spec.color;
              e.currentTarget.style.transform = 'translateY(-5px)';
            }} onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${spec.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', marginLeft: isRTL ? 'auto' : '0' }}>{spec.icon}</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{spec.title}</div>
              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>{spec.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recently Added Section */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '32px',
        flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: isRTL ? 'flex-end' : 'flex-start'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>{isRTL ? 'أحدث المنتجات المعروضة' : 'Latest Arrivals'}</h2>
        <div style={{ width: '5px', height: '28px', background: 'linear-gradient(to bottom, #10B981, #34D399)', borderRadius: '10px' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '100px' }}>
        {loading ? (
          <div style={{ color: '#64748B', padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>Loading...</div>
        ) : recentProducts.map(p => (
          <div key={p.id} style={{ 
            background: '#0F1624', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.07)', 
            overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
          }}>
            <div style={{ height: '200px', background: '#161E30', position: 'relative' }}>
              {p.image_url ? (
                <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' }}>{p.emoji || '📦'}</div>
              )}
              <div style={{ 
                position: 'absolute', top: '15px', [isRTL ? 'left' : 'right']: '15px', 
                background: 'rgba(16,185,129,0.9)', color: 'white', padding: '5px 12px', 
                borderRadius: '10px', fontSize: '11px', fontWeight: 800, backdropFilter: 'blur(4px)' 
              }}>
                {p.subcat_name || p.specialty}
              </div>
            </div>
            
            <div style={{ padding: '24px', flex: 1, textAlign: isRTL ? 'right' : 'left', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ color: '#64748B', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <span>👤</span>
                    <span>{p.vendor?.full_name || (isRTL ? 'مورد موثوق' : 'Verified Vendor')}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div style={{ color: '#10B981', fontWeight: 900, fontSize: '20px', marginBottom: '20px' }}>{p.price.toLocaleString()} DZD</div>
                <button 
                  onClick={() => openCheckout(p)}
                  style={{ 
                    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #F97316, #EA580C)', 
                    color: 'white', border: 'none', borderRadius: '15px', fontWeight: 800, 
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(249,115,22,0.3)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isRTL ? 'طلب شراء سريع' : 'Quick Buy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0F1624', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
             <h2 style={{ color: 'white', marginBottom: '10px', textAlign: isRTL ? 'right' : 'left', fontSize: '24px', fontWeight: 900 }}>{isRTL ? 'تأكيد طلب الشراء' : 'Confirm Order'}</h2>
             <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '30px', textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'يرجى إدخال بيانات التوصيل لإتمام العملية' : 'Please enter shipping details to complete'}</p>
             
             <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>{selectedProduct.name}</div>
                <div style={{ color: '#10B981', fontWeight: 900, fontSize: '20px' }}>{selectedProduct.price.toLocaleString()} DZD</div>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input placeholder={isRTL ? 'الولاية / المدينة' : 'City / State'} value={shippingInfo.city} onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})} style={{ width: '100%', padding: '14px 20px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', textAlign: isRTL ? 'right' : 'left', outline: 'none' }} />
                <input placeholder={isRTL ? 'العنوان بالتفصيل' : 'Detailed Address'} value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} style={{ width: '100%', padding: '14px 20px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', textAlign: isRTL ? 'right' : 'left', outline: 'none' }} />
                <input placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'} value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} style={{ width: '100%', padding: '14px 20px', background: '#161E30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', textAlign: isRTL ? 'right' : 'left', outline: 'none' }} />
             </div>

             <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                <button onClick={handleConfirmOrder} disabled={buying} style={{ flex: 2, padding: '16px', background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', fontSize: '15px' }}>
                  {buying ? (isRTL ? 'جاري التأكيد...' : 'Confirming...') : (isRTL ? 'تأكيد الشراء' : 'Confirm Purchase')}
                </button>
                <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '16px', background: 'transparent', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', fontSize: '15px' }}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

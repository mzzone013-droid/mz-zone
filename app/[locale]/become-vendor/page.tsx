'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const specialtyOptions = [
  { value: 'instrumentation', label: '🎛️ الأدواتية والقياس' },
  { value: 'electrical',      label: '⚡ الكهرباء الصناعية' },
  { value: 'automation',      label: '🤖 الأتمتة والتحكم' },
  { value: 'mechanics',       label: '⚙️ الميكانيك' },
  { value: 'hydraulics',      label: '💧 الهيدروليك' },
  { value: 'hse',             label: '🦺 السلامة والصيانة' },
];

export default function BecomeVendorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company_name: '',
    contact_phone: '',
    address: '',
    specialty: [] as string[],
  });

  const toggleSpecialty = (val: string) => {
    setForm(prev => ({
      ...prev,
      specialty: prev.specialty.includes(val)
        ? prev.specialty.filter(s => s !== val)
        : [...prev.specialty, val]
    }));
  };

  const handleSubmit = async () => {
    if (!form.company_name || form.specialty.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          contact_email: session?.user?.email,
          user_id: (session?.user as any)?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error === 'Already registered'
          ? 'لقد قدمت طلباً من قبل. حالة طلبك: ' + data.status
          : 'حدث خطأ. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{
      minHeight: '100vh', background: '#070B14',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#0F1624', border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '480px'
      }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: '#F1F5F9', fontFamily: 'inherit' }}>
          تم إرسال طلبك بنجاح
        </div>
        <div style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.7, fontFamily: 'inherit' }}>
          سيقوم الأدمن بمراجعة طلبك والموافقة عليه قريباً.
          ستتمكن بعدها من الوصول إلى لوحة تحكم المورد.
        </div>
        <button
          onClick={() => router.push('/ar/dashboard')}
          style={{
            marginTop: '28px', padding: '12px 32px',
            background: 'linear-gradient(135deg,#F97316,#EA7208)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
          }}
        >العودة للرئيسية</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: '#070B14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px', padding: '48px', width: '560px', maxWidth: '100%'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏭</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', marginBottom: '8px', fontFamily: 'inherit' }}>
            أصبح موردًا على MZ-Zone
          </div>
          <div style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit' }}>
            أضف منتجاتك الصناعية وابدأ البيع على المنصة
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
            color: '#F43F5E', fontSize: '13px', fontFamily: 'inherit'
          }}>{error}</div>
        )}

        {/* Company Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '8px', fontFamily: 'inherit' }}>
            اسم الشركة / المؤسسة *
          </label>
          <input
            value={form.company_name}
            onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
            placeholder="مثال: شركة الجزائر للمعدات الصناعية"
            style={{
              width: '100%', background: '#161E30',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px',
              padding: '13px 17px', fontSize: '14px', color: '#F1F5F9',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              textAlign: 'right'
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '8px', fontFamily: 'inherit' }}>
            رقم الهاتف
          </label>
          <input
            value={form.contact_phone}
            onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
            placeholder="05XXXXXXXX"
            style={{
              width: '100%', background: '#161E30',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px',
              padding: '13px 17px', fontSize: '14px', color: '#F1F5F9',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              textAlign: 'right'
            }}
          />
        </div>

        {/* Specialties */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '12px', fontFamily: 'inherit' }}>
            التخصصات * (اختر واحد أو أكثر)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {specialtyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleSpecialty(opt.value)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s',
                  border: form.specialty.includes(opt.value)
                    ? '1.5px solid #F97316' : '1.5px solid rgba(255,255,255,0.1)',
                  background: form.specialty.includes(opt.value)
                    ? 'rgba(249,115,22,0.1)' : '#161E30',
                  color: form.specialty.includes(opt.value) ? '#F97316' : '#94A3B8',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !form.company_name || form.specialty.length === 0}
          style={{
            width: '100%', padding: '15px',
            background: loading ? '#374151' : 'linear-gradient(135deg,#F97316,#EA7208)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            opacity: (!form.company_name || form.specialty.length === 0) ? 0.5 : 1
          }}
        >
          {loading ? '⏳ جاري الإرسال...' : '🚀 إرسال طلب الانضمام'}
        </button>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { SPECIALTIES_DATA } from '@/lib/data';

const FIELD: React.CSSProperties = {
  width: '100%', background: '#0A0F1C',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'white', padding: '12px 14px', borderRadius: '10px',
  outline: 'none', fontSize: '14px', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const LABEL: React.CSSProperties = {
  display: 'block', color: '#94A3B8', fontSize: '12px',
  fontWeight: 700, marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const specialtyEntries = Object.entries(SPECIALTIES_DATA) as [
  keyof typeof SPECIALTIES_DATA,
  (typeof SPECIALTIES_DATA)[keyof typeof SPECIALTIES_DATA]
][];

export default function AddProductModal({ locale }: { locale: string }) {
  const router = useRouter();
  const isRTL = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', price: '', reference: '',
    image_url: '', vendor_user_id: '',
    specialty: '' as keyof typeof SPECIALTIES_DATA | '',
    subcat_id: '', subcat_name: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const subcats = form.specialty ? SPECIALTIES_DATA[form.specialty].subcats : [];

  const handleSpecialtyChange = (val: string) => {
    setForm(f => ({ ...f, specialty: val as any, subcat_id: '', subcat_name: '' }));
  };

  const handleSubcatChange = (val: string) => {
    const sc = subcats.find(s => s.id === val);
    setForm(f => ({ ...f, subcat_id: val, subcat_name: sc?.name_ar || '' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('products').upload(path, file);
    if (error) {
      alert(isRTL ? 'فشل رفع الصورة' : 'Image upload failed');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
    set('image_url', publicUrl);
    setUploading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', description: '', price: '', reference: '', image_url: '', vendor_user_id: '', specialty: '', subcat_id: '', subcat_name: '' });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert(isRTL ? 'اسم المنتج مطلوب' : 'Product name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.error || 'Error'); return; }
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg,#F97316,#FBBF24)',
          border: 'none', borderRadius: '12px', color: 'white',
          fontSize: '14px', fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(249,115,22,0.35)',
        }}
      >
        {isRTL ? '+ إضافة منتج' : '+ Add Product'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#0F1624', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto',
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>
                {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
              </h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Specialty dropdown */}
              <div>
                <label style={LABEL}>{isRTL ? 'التخصص *' : 'Specialty *'}</label>
                <select
                  value={form.specialty}
                  onChange={e => handleSpecialtyChange(e.target.value)}
                  style={{ ...FIELD, cursor: 'pointer' }}
                >
                  <option value=''>{isRTL ? '-- اختر التخصص --' : '-- Select Specialty --'}</option>
                  {specialtyEntries.map(([key, spec]) => (
                    <option key={key} value={key}>
                      {spec.icon} {isRTL ? spec.title_ar : spec.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory dropdown — only shown after specialty is chosen */}
              <div>
                <label style={{ ...LABEL, opacity: form.specialty ? 1 : 0.5 }}>
                  {isRTL ? 'التصنيف الفرعي *' : 'Subcategory *'}
                </label>
                <select
                  value={form.subcat_id}
                  onChange={e => handleSubcatChange(e.target.value)}
                  disabled={!form.specialty}
                  style={{ ...FIELD, cursor: form.specialty ? 'pointer' : 'not-allowed', opacity: form.specialty ? 1 : 0.4 }}
                >
                  <option value=''>{isRTL ? '-- اختر التصنيف الفرعي --' : '-- Select Subcategory --'}</option>
                  {(subcats as any[]).map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.icon} {isRTL ? sc.name_ar : sc.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label style={LABEL}>{isRTL ? 'اسم المنتج *' : 'Product Name *'}</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} style={FIELD} />
              </div>

              {/* Reference */}
              <div>
                <label style={LABEL}>{isRTL ? 'المرجع / Reference' : 'Reference'}</label>
                <input value={form.reference} onChange={e => set('reference', e.target.value)} style={{ ...FIELD, textAlign: 'left' as const }} placeholder="REF-001" />
              </div>

              {/* Description */}
              <div>
                <label style={LABEL}>{isRTL ? 'الوصف' : 'Description'}</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...FIELD, resize: 'vertical' }} />
              </div>

              {/* Price */}
              <div>
                <label style={LABEL}>{isRTL ? 'السعر (DZD)' : 'Price (DZD)'}</label>
                <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} style={{ ...FIELD, textAlign: 'center' as const }} placeholder="0" />
              </div>

              {/* Vendor User ID */}
              <div>
                <label style={LABEL}>{isRTL ? 'معرف المورد (اختياري)' : 'Vendor User ID (optional)'}</label>
                <input value={form.vendor_user_id} onChange={e => set('vendor_user_id', e.target.value)} style={FIELD} placeholder={isRTL ? 'اتركه فارغاً لنسبه لك' : 'Leave empty to assign to yourself'} />
              </div>

              {/* Image upload */}
              <div>
                <label style={LABEL}>{isRTL ? 'صورة المنتج' : 'Product Image'}</label>
                <div style={{ border: '2px dashed rgba(249,115,22,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', background: 'rgba(249,115,22,0.04)' }}>
                  {form.image_url ? (
                    <div>
                      <img src={form.image_url} style={{ maxHeight: '100px', borderRadius: '8px', marginBottom: '8px' }} />
                      <div style={{ fontSize: '12px', color: '#10B981' }}>✓ {isRTL ? 'تم الرفع' : 'Uploaded'}</div>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
                      <div style={{ color: '#64748B', fontSize: '13px', fontFamily: 'inherit' }}>
                        {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'انقر لرفع صورة' : 'Click to upload')}
                      </div>
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                style={{
                  flex: 1, padding: '14px',
                  background: saving ? '#1E293B' : 'linear-gradient(135deg,#F97316,#FBBF24)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  fontSize: '15px', fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {saving ? '⏳...' : (isRTL ? 'حفظ المنتج' : 'Save Product')}
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '14px 20px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                  color: '#94A3B8', fontSize: '15px', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

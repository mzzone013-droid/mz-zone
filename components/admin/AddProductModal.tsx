'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

const FIELD_STYLE: React.CSSProperties = {
  width: '100%', background: '#0A0F1C', border: '1px solid rgba(255,255,255,0.08)',
  color: 'white', padding: '12px 14px', borderRadius: '10px', outline: 'none',
  fontSize: '14px', boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block', color: '#94A3B8', fontSize: '12px', fontWeight: 700,
  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function AddProductModal({ locale }: { locale: string }) {
  const router = useRouter();
  const isRTL = locale === 'ar';
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', specialty: '',
    reference: '', image_url: '', vendor_user_id: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

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

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert(isRTL ? 'اسم المنتج مطلوب' : 'Product name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Error');
        return;
      }
      setOpen(false);
      setForm({ name: '', description: '', price: '', specialty: '', reference: '', image_url: '', vendor_user_id: '' });
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
          padding: '10px 20px', background: 'linear-gradient(135deg,#F97316,#FBBF24)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>
                {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
              </h2>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: '#64748B',
                fontSize: '22px', cursor: 'pointer', lineHeight: 1,
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={LABEL_STYLE}>{isRTL ? 'اسم المنتج *' : 'Product Name *'}</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} style={FIELD_STYLE} />
              </div>

              <div>
                <label style={LABEL_STYLE}>{isRTL ? 'المرجع / Reference' : 'Reference'}</label>
                <input value={form.reference} onChange={e => set('reference', e.target.value)} style={FIELD_STYLE} placeholder="REF-001" />
              </div>

              <div>
                <label style={LABEL_STYLE}>{isRTL ? 'الوصف' : 'Description'}</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  style={{ ...FIELD_STYLE, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={LABEL_STYLE}>{isRTL ? 'السعر (DZD)' : 'Price (DZD)'}</label>
                  <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} style={FIELD_STYLE} placeholder="0" />
                </div>
                <div>
                  <label style={LABEL_STYLE}>{isRTL ? 'التصنيف' : 'Category'}</label>
                  <input value={form.specialty} onChange={e => set('specialty', e.target.value)} style={FIELD_STYLE} placeholder={isRTL ? 'كهرباء، ميكانيك...' : 'Electrical, Mechanic...'} />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>{isRTL ? 'معرف المورد (اختياري)' : 'Vendor User ID (optional)'}</label>
                <input value={form.vendor_user_id} onChange={e => set('vendor_user_id', e.target.value)} style={FIELD_STYLE} placeholder={isRTL ? 'اتركه فارغاً لنسبه لك' : 'Leave empty to assign to yourself'} />
              </div>

              <div>
                <label style={LABEL_STYLE}>{isRTL ? 'صورة المنتج' : 'Product Image'}</label>
                <div style={{
                  border: '2px dashed rgba(249,115,22,0.3)', borderRadius: '12px',
                  padding: '20px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(249,115,22,0.04)',
                }}>
                  {form.image_url ? (
                    <div>
                      <img src={form.image_url} style={{ maxHeight: '100px', borderRadius: '8px', marginBottom: '8px' }} />
                      <div style={{ fontSize: '12px', color: '#10B981' }}>✓ {isRTL ? 'تم الرفع' : 'Uploaded'}</div>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
                      <div style={{ color: '#64748B', fontSize: '13px' }}>
                        {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'انقر لرفع صورة' : 'Click to upload image')}
                      </div>
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                style={{
                  flex: 1, padding: '14px',
                  background: saving ? '#1E293B' : 'linear-gradient(135deg,#F97316,#FBBF24)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  fontSize: '15px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? '⏳...' : (isRTL ? 'حفظ المنتج' : 'Save Product')}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '14px 20px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                  color: '#94A3B8', fontSize: '15px', cursor: 'pointer',
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

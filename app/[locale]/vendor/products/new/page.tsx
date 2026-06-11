'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIALTIES } from '@/lib/data'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    specialty: '',
    subcat_id: '',
    subcat_name: '',
    name: '',
    reference: '',
    emoji: '📦',
    description: '',
    price: '',
    quantity: '',
    urgent_delivery: false,
    image_url: '',
  })

  const specialtyOptions = (Object.entries(SPECIALTIES) as any[]).map(([key, spec]) => ({
    value: key,
    label: `${spec.icon} ${spec.title_ar}`,
  }))

  // Dynamic subcats based on chosen specialty
  const subcats = form.specialty
    ? ((SPECIALTIES as any)[form.specialty]?.subcats || [])
    : []

  const handleImage = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
      setForm(p => ({ ...p, image_url: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    if (!form.specialty)   return 'اختر التخصص'
    if (!form.subcat_id)   return 'اختر التصنيف الفرعي'
    if (!form.name.trim()) return 'أدخل اسم المنتج'
    if (!form.reference.trim()) return 'أدخل الرقم المرجعي'
    if (!form.price || Number(form.price) <= 0) return 'أدخل سعراً صحيحاً'
    if (!form.quantity || Number(form.quantity) < 0) return 'أدخل الكمية'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
        })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return }
      setSuccess(true)
      setTimeout(() => router.push('/ar/vendor/products'), 1500)
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  // Input style reused
  const inputStyle = {
    width: '100%', background: '#161E30',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px', padding: '13px 17px',
    fontSize: '14px', color: '#F1F5F9', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box' as const,
    textAlign: 'right' as const
  }

  const labelStyle = {
    fontSize: '12px', color: '#94A3B8',
    display: 'block', marginBottom: '8px',
    fontFamily: 'inherit'
  }

  if (success) return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'inherit' }}>
          تم رفع المنتج بنجاح!
        </div>
        <div style={{ color: '#94A3B8', marginTop: '8px', fontFamily: 'inherit' }}>
          جاري التحويل...
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'inherit' }}>
          📦 إضافة منتج جديد
        </div>
        <div style={{ color: '#64748B', fontSize: '13px', marginTop: '6px', fontFamily: 'inherit' }}>
          أملأ جميع الحقول المطلوبة برمز (*)
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
          color: '#F43F5E', fontSize: '13px', fontFamily: 'inherit'
        }}>⚠️ {error}</div>
      )}

      <div style={{
        background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '32px', display: 'flex',
        flexDirection: 'column', gap: '20px'
      }}>

        {/* Specialty */}
        <div>
          <label style={labelStyle}>التخصص *</label>
          <select
            value={form.specialty}
            onChange={e => setForm(p => ({ ...p, specialty: e.target.value, subcat_id: '', subcat_name: '' }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value=''>-- اختر التخصص --</option>
            {specialtyOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Subcat */}
        <div>
          <label style={labelStyle}>التصنيف الفرعي *</label>
          <select
            value={form.subcat_id}
            onChange={e => {
              const sc = subcats.find((s: any) => s.id === e.target.value)
              setForm(p => ({ ...p, subcat_id: e.target.value, subcat_name: sc?.name_ar || sc?.name || '' }))
            }}
            disabled={!form.specialty}
            style={{ ...inputStyle, cursor: form.specialty ? 'pointer' : 'not-allowed', opacity: form.specialty ? 1 : 0.5 }}
          >
            <option value=''>-- اختر التصنيف --</option>
            {subcats.map((sc: any) => (
              <option key={sc.id} value={sc.id}>{sc.icon} {sc.name_ar || sc.name}</option>
            ))}
          </select>
        </div>

        {/* Product Name */}
        <div>
          <label style={labelStyle}>اسم المنتج *</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder='مثال: مقياس ضغط ستانلس ستيل'
            style={inputStyle}
          />
        </div>

        {/* Reference */}
        <div>
          <label style={labelStyle}>الرقم المرجعي *</label>
          <input
            value={form.reference}
            onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
            placeholder='مثال: PT-SS-100-BAR'
            style={{ ...inputStyle, textAlign: 'left' as const }}
          />
        </div>

        {/* Price + Quantity side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>السعر (دج) *</label>
            <input
              type='number' min='0'
              value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              placeholder='0'
              style={{ ...inputStyle, textAlign: 'center' as const }}
            />
          </div>
          <div>
            <label style={labelStyle}>الكمية المتاحة *</label>
            <input
              type='number' min='0'
              value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder='0'
              style={{ ...inputStyle, textAlign: 'center' as const }}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label style={labelStyle}>صورة المنتج</label>
          <div style={{
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '24px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'border-color 0.2s',
            position: 'relative'
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            {imagePreview ? (
              <div>
                <img src={imagePreview} style={{
                  maxHeight: '160px', borderRadius: '8px',
                  objectFit: 'contain', marginBottom: '8px'
                }} />
                <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'inherit' }}>
                  انقر لتغيير الصورة
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
                <div style={{ color: '#64748B', fontSize: '13px', fontFamily: 'inherit' }}>
                  انقر لرفع صورة المنتج
                </div>
                <div style={{ color: '#475569', fontSize: '11px', marginTop: '4px', fontFamily: 'inherit' }}>
                  PNG, JPG حتى 5MB
                </div>
              </div>
            )}
            <input
              type='file' accept='image/*'
              onChange={handleImage}
              style={{
                position: 'absolute', inset: 0,
                opacity: 0, cursor: 'pointer', width: '100%'
              }}
            />
          </div>
        </div>

        {/* Emoji */}
        <div>
          <label style={labelStyle}>الرمز التعبيري</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['📦','⚙️','🔧','🔩','⚡','🎛️','💧','🦺','🤖','🔌','🛠️','📡'].map(em => (
              <button key={em}
                onClick={() => setForm(p => ({ ...p, emoji: em }))}
                style={{
                  width: '42px', height: '42px', fontSize: '20px',
                  borderRadius: '10px', cursor: 'pointer',
                  border: form.emoji === em
                    ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.07)',
                  background: form.emoji === em
                    ? 'rgba(249,115,22,0.15)' : '#161E30',
                  transition: 'all 0.15s'
                }}
              >{em}</button>
            ))}
          </div>
        </div>

        {/* Urgent delivery toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: '#161E30', borderRadius: '12px', padding: '14px 18px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'inherit' }}>
              ⚡ تسليم سريع
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'inherit' }}>
              إمكانية التوصيل خلال 24-48 ساعة
            </div>
          </div>
          <div
            onClick={() => setForm(p => ({ ...p, urgent_delivery: !p.urgent_delivery }))}
            style={{
              width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
              background: form.urgent_delivery ? '#F97316' : '#1D2840',
              position: 'relative', transition: 'background 0.2s',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{
              position: 'absolute', top: '3px',
              right: form.urgent_delivery ? '3px' : '21px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'white', transition: 'right 0.2s'
            }} />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? '#374151' : 'linear-gradient(135deg,#F97316,#EA7208)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            marginTop: '8px'
          }}
        >
          {loading ? '⏳ جاري الرفع...' : '🚀 رفع المنتج'}
        </button>

      </div>
    </div>
  )
}

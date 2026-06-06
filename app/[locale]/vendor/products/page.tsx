'use client'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  reference: string
  specialty: string
  subcat_name: string
  price: number
  quantity: number
  image_url: string | null
  emoji: string | null
}

const specialtyColors: Record<string, string> = {
  instrumentation: '#3B82F6',
  electrical: '#F59E0B',
  automation: '#8B5CF6',
  mechanics: '#10B981',
  hydraulics: '#06B6D4',
  hse: '#F97316',
}

export default function VendorProductsPage() {
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/products')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    try {
      const res = await fetch('/api/vendor/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: newQty })
      })
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, quantity: newQty } : p))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) return
    try {
      const res = await fetch('/api/vendor/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#94A3B8' }}>{isRTL ? '⏳ جاري التحميل...' : 'Loading...'}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>
          {isRTL ? '📦 منتجاتي' : 'My Products'}
        </h2>
        <div style={{ fontSize: '13px', color: '#64748B' }}>{products.length} {isRTL ? 'منتج' : 'products'}</div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#0F1624', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏭</div>
          <div style={{ fontSize: '18px', color: '#F1F5F9', marginBottom: '8px', fontWeight: 700 }}>
            {isRTL ? 'لا توجد منتجات بعد' : 'No products yet'}
          </div>
          <Link href={`/${locale}/vendor/products/new`} style={{ color: '#F97316', textDecoration: 'none', fontWeight: 700 }}>
            {isRTL ? '+ أضف أول منتج الآن' : '+ Add your first product'}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: '#0F1624', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '12px',
                  background: '#161E30', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {p.image_url ? <img src={p.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize: '32px'}}>{p.emoji || '📦'}</span>}
                </div>
                <span style={{
                  padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                  background: `${specialtyColors[p.specialty] || '#64748B'}20`,
                  color: specialtyColors[p.specialty] || '#94A3B8',
                }}>
                  {p.subcat_name || p.specialty}
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px', fontFamily: 'monospace' }}>Ref: {p.reference}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px' }}>{isRTL ? 'السعر' : 'Price'}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981' }}>{p.price} DZD</div>
                </div>
                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px' }}>{isRTL ? 'الكمية' : 'Qty'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161E30', padding: '4px', borderRadius: '8px' }}>
                    <button onClick={() => handleUpdateQuantity(p.id, Math.max(0, p.quantity - 1))} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{p.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(p.id, p.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(p.id)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                  color: '#F43F5E', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🗑️ {isRTL ? 'حذف المنتج' : 'Delete'}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

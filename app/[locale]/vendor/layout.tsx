'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { use } from 'react'

export default function VendorLayout({
  children,
  params: paramsPromise
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const params = use(paramsPromise)
  const locale = params.locale
  const isRTL = locale === 'ar'
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const isProducts = pathname.endsWith('/vendor/products')
  const isNewProduct = pathname.endsWith('/vendor/products/new')

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#F1F5F9' }}>
      
      {/* Simple Vendor Topbar */}
      <div style={{
        background: '#0F1624',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        
        {/* Vendor Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Removed redundant logout and profile info to avoid duplication with global topbar */}
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', gap: '12px' }}>
          <Link href={`/${locale}/vendor/products/new`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px', borderRadius: '8px',
              background: isNewProduct ? '#F97316' : 'transparent',
              border: isNewProduct ? 'none' : '1px solid rgba(255,255,255,0.1)',
              color: isNewProduct ? 'white' : '#94A3B8',
              fontSize: '13px', fontWeight: isNewProduct ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              ➕ إضافة منتج
            </button>
          </Link>
          <Link href={`/${locale}/vendor/products`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px', borderRadius: '8px',
              background: isProducts ? '#161E30' : 'transparent',
              border: isProducts ? '1px solid rgba(255,255,255,0.1)' : 'none',
              color: isProducts ? 'white' : '#94A3B8',
              fontSize: '13px', fontWeight: isProducts ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              📦 منتجاتي
            </button>
          </Link>
        </nav>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>
            MZ<span style={{ color: '#F97316' }}>-</span>ZONE
          </div>
        </div>

      </div>

      <style>{`
        @media (min-width: 901px) {
          .vendor-main { margin-${isRTL ? 'right' : 'left'}: 260px !important; }
        }
        @media (max-width: 900px) {
          .vendor-main { padding: 20px 15px 100px 15px !important; margin: 0 !important; }
          .vendor-topbar { display: none !important; }
        }
      `}</style>

      {/* Main Content */}
      <main className="vendor-main" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
        {children}
      </main>

    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const roles = [
  { value: 'user',   label: '👤 مستخدم' },
  { value: 'vendor', label: '🏭 مورد' },
  { value: 'admin',  label: '🛡️ أدمين' },
  { value: 'banned', label: '🚫 محظور' },
]

export default function UserRoleSelector({ 
  userId, 
  currentRole 
}: { 
  userId: string
  currentRole: string 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const changeRole = async (newRole: string) => {
    if (newRole === currentRole) return
    setLoading(true)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      router.refresh()
    } finally {
      setLoading(false)
      setShowDelete(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      
      {/* Role Dropdown */}
      <select
        value={currentRole}
        onChange={e => changeRole(e.target.value)}
        disabled={loading}
        style={{
          background: '#161E30',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '6px 10px',
          color: '#F1F5F9',
          fontSize: '12px',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      >
        {roles.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      {/* Delete Button */}
      <button
        onClick={() => setShowDelete(true)}
        disabled={loading}
        style={{
          width: '32px', height: '32px',
          background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', transition: 'all 0.2s'
        }}
        title="حذف المستخدم"
      >🗑️</button>

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0F1624',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '20px', padding: '36px',
            maxWidth: '400px', width: '90%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ 
              fontSize: '18px', fontWeight: 700, 
              color: '#F1F5F9', marginBottom: '10px',
              fontFamily: 'inherit'
            }}>
              حذف المستخدم نهائياً؟
            </div>
            <div style={{ 
              fontSize: '13px', color: '#94A3B8', 
              marginBottom: '28px', lineHeight: 1.6,
              fontFamily: 'inherit'
            }}>
              لا يمكن التراجع عن هذا الإجراء.
              سيتم حذف جميع بيانات المستخدم.
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDelete(false)}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: '#161E30', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94A3B8', cursor: 'pointer', 
                  fontSize: '13px', fontFamily: 'inherit'
                }}
              >إلغاء</button>
              <button
                onClick={deleteUser}
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: 'rgba(244,63,94,0.9)', border: 'none',
                  color: 'white', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, fontFamily: 'inherit'
                }}
              >{loading ? '...' : '🗑️ حذف نهائياً'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

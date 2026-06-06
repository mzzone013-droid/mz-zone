import { supabaseAdmin } from '@/lib/supabase-admin'
import UserRoleSelector from '@/components/admin/UserRoleSelector'

export default async function AdminUsersPage() {
  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '28px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ 
          fontSize: '22px', fontWeight: 700, 
          color: '#F1F5F9', marginBottom: '6px',
          fontFamily: 'inherit'
        }}>
          👥 إدارة المستخدمين
        </div>
        <div style={{ fontSize: '13px', color: '#64748B', fontFamily: 'inherit' }}>
          {users?.length ?? 0} مستخدم مسجل
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#0F1624',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
          padding: '14px 20px',
          background: '#161E30',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontSize: '11px',
          color: '#64748B',
          fontWeight: 600,
          letterSpacing: '0.5px',
          fontFamily: 'inherit',
          textAlign: 'right'
        }}>
          <span>المستخدم</span>
          <span>البريد الإلكتروني</span>
          <span>الصلاحية</span>
          <span>تاريخ التسجيل</span>
          <span>الإجراءات</span>
        </div>

        {/* Rows */}
        {users?.map(user => (
          <div key={user.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            alignItems: 'center',
            textAlign: 'right'
          }}>
            
            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#F97316,#FBBF24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0
              }}>
                {user.avatar_url 
                  ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()
                }
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'inherit' }}>
                {user.full_name || 'بدون اسم'}
              </span>
            </div>

            {/* Email */}
            <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'inherit' }}>
              {user.email}
            </span>

            {/* Role Badge */}
            <div>
              {(() => {
                const roleConfig: Record<string, {label: string, bg: string, color: string}> = {
                  admin:  { label: 'أدمين', bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6' },
                  vendor: { label: 'مورد',  bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6' },
                  user:   { label: 'مستخدم',bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
                  banned: { label: 'محظور', bg: 'rgba(244,63,94,0.15)',   color: '#F43F5E' },
                }
                const cfg = roleConfig[user.role] || roleConfig.user
                return (
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600,
                    background: cfg.bg, color: cfg.color,
                    fontFamily: 'inherit'
                  }}>
                    {cfg.label}
                  </span>
                )
              })()}
            </div>

            {/* Date */}
            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'inherit' }}>
              {new Date(user.created_at).toLocaleDateString('ar-DZ')}
            </span>

            {/* Actions — client component */}
            <UserRoleSelector userId={user.id} currentRole={user.role} />

          </div>
        ))}

        {/* Empty state */}
        {(!users || users.length === 0) && (
          <div style={{ 
            padding: '60px', textAlign: 'center', 
            color: '#475569', fontFamily: 'inherit' 
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
            <div>لا يوجد مستخدمون مسجلون بعد</div>
          </div>
        )}
      </div>
    </div>
  )
}

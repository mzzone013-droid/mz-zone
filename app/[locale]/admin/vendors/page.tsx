import { supabaseAdmin } from '@/lib/supabase-admin';
import { useLocale } from 'next-intl';

export default async function AdminVendorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  // جلب كافة المستخدمين الذين رتبتهم 'vendor' من جدول profiles
  const { data: vendors, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('role', 'vendor')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching vendors:', error);

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{isRTL ? 'إدارة الموردين' : 'Vendor Management'}</h2>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            {isRTL ? `${vendors?.length || 0} مورد مسجل` : `${vendors?.length || 0} registered vendors`}
          </div>
        </div>
      </div>

      <div style={{ background: '#0F1624', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'المورد' : 'Vendor'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'تاريخ الانضمام' : 'Joined'}</th>
            </tr>
          </thead>
          <tbody>
            {!vendors || vendors.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏭</div>
                  {isRTL ? 'لا يوجد موردون مسجلون حتى الآن' : 'No vendors registered yet'}
                </td>
              </tr>
            ) : vendors.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,#F97316,#FBBF24)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 700, color: 'white'
                    }}>
                      {v.avatar_url ? <img src={v.avatar_url} style={{width:'100%', height:'100%', borderRadius:'50%'}} /> : (v.full_name?.[0] || v.email?.[0]).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>{v.full_name || '—'}</div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94A3B8' }}>{v.email}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                    background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)'
                  }}>
                    {isRTL ? 'مورد نشط' : 'Active Vendor'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B' }}>
                  {new Date(v.created_at).toLocaleDateString('ar-DZ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

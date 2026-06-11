import { supabaseAdmin } from '@/lib/supabase-admin';
import VendorActions from '@/components/admin/VendorActions';

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  pending:  { background: 'rgba(245,158,11,0.15)',  color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)'  },
  approved: { background: 'rgba(16,185,129,0.15)',  color: '#10B981', border: '1px solid rgba(16,185,129,0.3)'  },
  rejected: { background: 'rgba(244,63,94,0.1)',    color: '#F43F5E', border: '1px solid rgba(244,63,94,0.3)'   },
};

const STATUS_LABEL_AR: Record<string, string> = {
  pending: 'بانتظار الموافقة',
  approved: 'مورد نشط',
  rejected: 'مرفوض',
};

export default async function AdminVendorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRTL = locale === 'ar';

  const { data: vendors, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching vendors:', error);

  const userIds = (vendors || []).map((v: any) => v.user_id).filter(Boolean);
  let profileMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);
    profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
  }

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
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'الشركة' : 'Company'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'الحالة' : 'Status'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'تاريخ الطلب' : 'Applied'}</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{isRTL ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {!vendors || vendors.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏭</div>
                  {isRTL ? 'لا يوجد موردون مسجلون حتى الآن' : 'No vendors registered yet'}
                </td>
              </tr>
            ) : (vendors as any[]).map(v => {
              const profile = profileMap[v.user_id];
              const statusStyle = STATUS_STYLE[v.status] || STATUS_STYLE.pending;
              return (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#F97316,#FBBF24)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: 'white', overflow: 'hidden',
                      }}>
                        {profile?.avatar_url
                          ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                          : (v.company_name?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>{v.company_name || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>{profile?.full_name || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94A3B8' }}>{profile?.email || '—'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, ...statusStyle }}>
                      {isRTL ? (STATUS_LABEL_AR[v.status] || v.status) : (v.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '12px', color: '#64748B' }}>
                    {new Date(v.created_at).toLocaleDateString(isRTL ? 'ar-DZ' : 'en-GB')}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <VendorActions vendorId={v.id} userId={v.user_id} currentStatus={v.status || 'pending'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

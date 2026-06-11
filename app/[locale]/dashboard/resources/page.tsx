'use client';
import { useLocale } from 'next-intl';

const resources = [
  { id: 'datasheets', icon: '📄', title_ar: 'Data Sheets المنتجات', title_en: 'Product Data Sheets', desc_ar: 'أكثر من 2,400 ورقة بيانات فنية من أبرز العلامات العالمية (Siemens, Schneider, ABB...)', color: '#06B6D4' },
  { id: 'manuals', icon: '📋', title_ar: 'أدلة الصيانة والتشغيل', title_en: 'Maintenance Manuals', desc_ar: 'إجراءات الصيانة الوقائية والتصحيحية للأجهزة الصناعية مترجمة ومعتمدة.', color: '#F59E0B' },
  { id: 'tutorials', icon: '🎥', title_ar: 'دروس فنية مرئية', title_en: 'Video Tutorials', desc_ar: 'شروحات عملية بالفيديو لتركيب وبرمجة الحساسات والمحركات و PLC.', color: '#8B5CF6' },
];

export default function ResourcesPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ textAlign: isRTL ? 'right' : 'left', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
          <span style={{ order: isRTL ? 2 : 1 }}>{isRTL ? 'الموارد التقنية' : 'Technical Resources'}</span>
          <span style={{ fontSize: '36px', order: isRTL ? 1 : 2 }}>📚</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '15px', maxWidth: '600px', marginLeft: isRTL ? 'auto' : '0' }}>
          {isRTL ? 'المكتبة الشاملة للوثائق الفنية، دلائل التشغيل، وشهادات المنتجات لجميع التخصصات.' : 'Comprehensive library of technical documents, operation manuals, and product certificates.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '80px' }}>
        {resources.map(res => (
          <div key={res.id} style={{
            background: '#0F1624',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            textAlign: isRTL ? 'right' : 'left'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = res.color;
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 12px 32px ${res.color}15`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: `${res.color}15`,
              border: `1px solid ${res.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', flexShrink: 0
            }}>
              {res.icon}
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                {isRTL ? res.title_ar : res.title_en}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                {isRTL ? res.desc_ar : res.title_en}
              </p>
            </div>

            <div style={{ color: '#475569', fontSize: '20px' }}>
              {isRTL ? '←' : '→'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

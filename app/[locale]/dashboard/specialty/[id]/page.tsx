'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { SPECIALTIES_DATA, SpecialtyKey } from '@/lib/data';
import { use } from 'react';
import { notFound } from 'next/navigation';

export default function SpecialtyPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = use(params);
  const t = useTranslations('common');
  const ts = useTranslations('specialties');

  if (!SPECIALTIES_DATA[id as SpecialtyKey]) {
    notFound();
  }

  const spec = SPECIALTIES_DATA[id as SpecialtyKey];

  const getTitle = () => {
    if (locale === 'ar') return spec.title_ar;
    if (locale === 'fr') return spec.title_fr;
    return spec.title_en;
  };

  const getSubcatName = (sc: any) => {
    if (locale === 'ar') return sc.name_ar;
    if (locale === 'fr') return sc.name_fr;
    return sc.name_en;
  };

  const getSubcatDesc = (sc: any) => {
    return locale === 'ar' ? sc.desc_ar : sc.desc_ar; // Assuming description is same or we could add more translations
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Link href={`/${locale}/dashboard`} className="back-btn">
        {locale === 'ar' ? '←' : '→'} {t('backToHome')}
      </Link>
      
      <div className="flex items-center gap-2 mb-5 text-[12.5px] text-[var(--text3)]">
        <Link href={`/${locale}/dashboard`} className="cursor-pointer transition-colors hover:text-[var(--text2)] text-inherit no-underline">
          {useTranslations('nav')('home')}
        </Link>
        <span className="text-[var(--border2)] text-[14px]">/</span>
        <span className="text-[var(--text)]">{getTitle()}</span>
      </div>

      <div className="page-header">
        <div className="page-title">{spec.icon} {getTitle()}</div>
        <div className="page-sub">{ts('selectSubcat')}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {spec.subcats.map((sc) => (
          <Link 
            key={sc.id} 
            href={`/${locale}/dashboard/products/${sc.id}?specialty=${id}`}
            className="subcat-card"
            style={{ '--c': spec.color } as any}
          >
            <div className="text-[28px] mb-3">{sc.icon}</div>
            <div className="text-[14px] font-bold mb-1">{getSubcatName(sc)}</div>
            <div className="text-[11px] text-[var(--text3)] mb-1.5">{locale === 'ar' ? sc.name_en : sc.name_ar}</div>
            <div className="text-[12px] text-[var(--text2)] leading-relaxed mb-3">{getSubcatDesc(sc)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

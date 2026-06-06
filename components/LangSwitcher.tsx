'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function LangSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLang = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath || `/${newLocale}`);
  };

  return (
    <div className="lang-switch">
      <button onClick={() => switchLang('ar')} className={`lang-btn ${currentLocale === 'ar' ? 'active' : ''}`}>AR</button>
      <button onClick={() => switchLang('en')} className={`lang-btn ${currentLocale === 'en' ? 'active' : ''}`}>EN</button>
      <button onClick={() => switchLang('fr')} className={`lang-btn ${currentLocale === 'fr' ? 'active' : ''}`}>FR</button>
    </div>
  );
}

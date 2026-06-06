import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'MZ-Zone | منصة التخصصات الصناعية',
  description: 'منصة MZ-Zone للتخصصات الصناعية: الأدواتية، الكهرباء، الأتمتة، الميكانيك، الهيدروليك، والسلامة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // نقوم بإزالة html و body من هنا لأنها موجودة في [locale]/layout.tsx
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

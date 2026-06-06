import { redirect } from 'next/navigation'

export default async function VendorHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/vendor/products`)
}

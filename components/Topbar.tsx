import { createClient } from '@/lib/supabase-server'
import TopbarUI from './TopbarUI'

export default async function Topbar({ locale }: { locale: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isRTL = locale === 'ar'

  let profileData = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, avatar_url')
      .eq('id', user.id)
      .single()
    profileData = profile
  }

  // Pass data to the Client Component for interactivity and responsiveness
  return <TopbarUI user={user} role={profileData?.role || 'user'} avatarUrl={profileData?.avatar_url} locale={locale} isRTL={isRTL} />
}

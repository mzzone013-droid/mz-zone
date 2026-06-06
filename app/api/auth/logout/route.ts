import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  
  // تسجيل الخروج من Supabase
  await supabase.auth.signOut()

  // إعادة التوجيه للصفحة الرئيسية
  const url = new URL(req.url)
  return NextResponse.redirect(new URL('/', url.origin), {
    status: 302,
  })
}

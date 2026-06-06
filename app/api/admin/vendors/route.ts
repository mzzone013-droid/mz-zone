import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// دالة مساعدة للتحقق من صلاحية الأدمن
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(session.user.id)
  
  if (user?.user?.app_metadata?.role !== 'admin') {
    return null
  }
  
  return session
}

// جلب جميع الموردين
export async function GET() {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// تعديل حالة المورد (موافقة أو رفض)
export async function PATCH(req: Request) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorId, status, rejectionReason } = await req.json()

  const updateData: any = { 
    status, 
    updated_at: new Date().toISOString() 
  }
  
  if (status === 'approved') {
    updateData.verified_at = new Date().toISOString()
  }
  
  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update(updateData)
    .eq('id', vendorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // تحديث دور المستخدم في Supabase Auth ليصبح "vendor" بعد الموافقة
  if (status === 'approved' && vendor?.user_id) {
    await supabaseAdmin.auth.admin.updateUserById(vendor.user_id, {
      app_metadata: { role: 'vendor' }
    })
  }

  return NextResponse.json({ success: true, vendor })
}

// حذف مورد
export async function DELETE(req: Request) {
  const session = await checkAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { vendorId } = await req.json()
  
  const { error } = await supabaseAdmin
    .from('vendors')
    .delete()
    .eq('id', vendorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

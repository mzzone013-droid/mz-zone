import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { vendorId, status, rejectionReason } = await req.json()

  const updateData: any = { status, updated_at: new Date().toISOString() }
  if (status === 'approved') updateData.verified_at = new Date().toISOString()
  if (rejectionReason) updateData.rejection_reason = rejectionReason

  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update(updateData)
    .eq('id', vendorId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status === 'approved' && vendor?.user_id) {
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', vendor.user_id)
  }

  return NextResponse.json({ success: true, vendor })
}

export async function DELETE(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { vendorId } = await req.json()
  const { error } = await supabaseAdmin.from('vendors').delete().eq('id', vendorId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

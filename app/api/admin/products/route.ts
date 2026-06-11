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

export async function POST(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, description, price, specialty, reference, image_url, vendor_user_id } = await req.json()

  if (!name) return NextResponse.json({ error: 'Product name is required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('vendor_products')
    .insert({
      name,
      description: description || null,
      price: Number(price) || 0,
      specialty: specialty || null,
      reference: reference || null,
      image_url: image_url || null,
      user_id: vendor_user_id || user.id,
      status: 'active',
      quantity: 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { productId } = await req.json()
  const { error } = await supabaseAdmin.from('vendor_products').delete().eq('id', productId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

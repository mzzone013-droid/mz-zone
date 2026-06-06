import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'user'

  if (role === 'admin') {
    const { data } = await supabase
      .from('vendor_products')
      .select('*')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  const { data } = await supabase
    .from('vendor_products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'user'
  if (role !== 'vendor' && role !== 'admin') {
    return NextResponse.json({ error: 'ليس لديك صلاحية المورد' }, { status: 403 })
  }

  const body = await req.json()

  if (!body.name || !body.reference || !body.price || !body.specialty || !body.subcat_id) {
    return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vendor_products')
    .insert({
      user_id: user.id,
      specialty: body.specialty,
      subcat_id: body.subcat_id,
      subcat_name: body.subcat_name || '',
      name: body.name,
      reference: body.reference,
      emoji: body.emoji || '📦',
      description: body.description || '',
      price: Number(body.price),
      quantity: Number(body.quantity) || 0,
      urgent_delivery: body.urgent_delivery || false,
      image_url: body.image_url || null,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

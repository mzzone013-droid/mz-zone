import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function getUser(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    product_id, vendor_id, supplier,
    product_name, product_ref, product_emoji,
    quantity, total_price, note,
    city, shipping_address, phone_number,
  } = body;

  if (!product_name) return NextResponse.json({ error: 'product_name is required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('orders').insert({
    user_id: user.id,
    product_id: product_id || null,
    vendor_id: vendor_id || null,
    supplier: supplier || null,
    product_name,
    product_ref: product_ref || null,
    product_emoji: product_emoji || null,
    quantity: quantity || 1,
    total_price,
    note: note || null,
    city: city || null,
    shipping_address: shipping_address || null,
    phone_number: phone_number || null,
    status: 'processing',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

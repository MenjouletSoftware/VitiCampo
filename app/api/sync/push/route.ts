import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { records } = body || {};
    if (!Array.isArray(records)) return NextResponse.json({ success: false, error: 'records required' }, { status: 400 });

    // insert each as a sync payload
    const payloads = records.map((r: any) => ({ type: r.type, payload: r.payload }));
    await supabaseServer.from('sync').insert(payloads);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

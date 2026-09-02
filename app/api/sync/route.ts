import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const results: any[] = [];

    for (const item of items) {
      const type = item.type;
      const payload = item.payload ?? item;

      if (type === 'work_order') {
        const { error } = await supabaseServer.from('work_orders').insert(payload);
        results.push({ type, error: error?.message ?? null });
      } else if (type === 'task_completion') {
        const { error } = await supabaseServer.from('field_tasks').insert(payload);
        results.push({ type, error: error?.message ?? null });
      } else {
        // Generic insert into 'sync' table for unknown types
        const { error } = await supabaseServer.from('sync').insert({ type, payload });
        results.push({ type, error: error?.message ?? null });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

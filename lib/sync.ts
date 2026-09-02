import { db } from '@/lib/dexie';
import { supabase } from '@/lib/supabase';

export async function syncPendingRecords() {
  if (!navigator.onLine) {
    return;
  }

  const pending = await db.pendingSync.toArray();
  if (!pending.length) {
    return;
  }

  for (const item of pending) {
    try {
      if (item.type === 'work_order') {
        const { error } = await supabase.from('work_orders').insert(item.payload);
        if (!error) {
          await db.pendingSync.delete(item.id!);
        }
      }

      if (item.type === 'task_completion') {
        const { error } = await supabase.from('field_tasks').insert(item.payload);
        if (!error) {
          await db.pendingSync.delete(item.id!);
        }
      }
    } catch (error) {
      console.warn('Sync failed:', error);
    }
  }
}

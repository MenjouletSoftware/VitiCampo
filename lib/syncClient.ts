import { db } from './dexie';

export async function pushPendingToServer() {
  const pending = await db.pendingSync.filter((p) => !p.synced).toArray();
  if (!pending.length) return { success: true, pushed: 0 };

  const records = pending.map((p) => ({ type: p.type, payload: p.payload }));

  const res = await fetch('/api/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });
  const json = await res.json();
  if (json?.success) {
    // mark local as synced
    await Promise.all(pending.map((p) => db.pendingSync.update(p.id!, { synced: true })));
    return { success: true, pushed: pending.length };
  }

  return { success: false, error: json?.error || 'unknown' };
}

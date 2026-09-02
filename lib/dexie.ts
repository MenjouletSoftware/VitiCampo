import Dexie, { type Table } from 'dexie';

export type PendingSyncType = 'work_order' | 'task_completion';

export interface PendingSyncRecord {
  id?: number;
  type: PendingSyncType;
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

class VitiCampoDB extends Dexie {
  pendingSync!: Table<PendingSyncRecord, number>;

  constructor() {
    super('viticampo-db');
    this.version(1).stores({
      pendingSync: '++id, type, createdAt, synced',
    });
  }
}

export const db = new VitiCampoDB();

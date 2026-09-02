'use client';

import { useMemo, useState } from 'react';
import { db } from '@/lib/dexie';
import { syncPendingRecords } from '@/lib/sync';

const defaultTasks = [
  { id: 1, title: 'Poda del bloque 2', assignee: 'Martín Ruiz', status: 'Pendiente' },
  { id: 2, title: 'Riego del lote norte', assignee: 'Ana Gómez', status: 'Pendiente' },
  { id: 3, title: 'Cosecha de parcela 3', assignee: 'Lucas Ponce', status: 'Pendiente' },
];

export function FieldTasksList() {
  const [tasks, setTasks] = useState(defaultTasks);
  const [amounts, setAmounts] = useState<Record<number, string>>({});

  const counts = useMemo(
    () => ({
      pending: tasks.filter((task) => task.status === 'Pendiente').length,
      completed: tasks.filter((task) => task.status === 'Completada').length,
    }),
    [tasks],
  );

  const handleFinishTask = async (id: number) => {
    const kilos = Number(amounts[id] ?? 0);
    await db.pendingSync.add({
      type: 'task_completion',
      payload: {
        taskId: id,
        kilos,
        completedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      synced: false,
    });

    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: 'Completada' } : task)));

    if (navigator.onLine) {
      await syncPendingRecords();
    }
  };

  return (
    <div className="card bg-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Operario de campo</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Tareas asignadas</h2>
        </div>
        <div className="text-right text-sm text-slate-600">
          <div>{counts.pending} pendientes</div>
          <div>{counts.completed} completadas</div>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-600">Asignado a: {task.assignee}</p>
                <p className="mt-2 inline-flex rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">{task.status}</p>
              </div>

              {task.status === 'Pendiente' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="field min-w-[120px]"
                    placeholder="Kilos"
                    value={amounts[task.id] ?? ''}
                    onChange={(event) => setAmounts((current) => ({ ...current, [task.id]: event.target.value }))}
                  />
                  <button type="button" onClick={() => handleFinishTask(task.id)} className="btn-secondary w-full min-w-[160px]">
                    Finalizar tarea
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

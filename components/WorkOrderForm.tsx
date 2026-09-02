'use client';

import { useState } from 'react';
import { db } from '@/lib/dexie';
import { syncPendingRecords } from '@/lib/sync';

const initialForm = {
  lote: 'Lote Norte',
  tarea: 'Poda',
  insumos: 'Poda, guantes, etiquetas',
  operario: 'Martín Ruiz',
};

export function WorkOrderForm() {
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await db.pendingSync.add({
      type: 'work_order',
      payload,
      createdAt: new Date().toISOString(),
      synced: false,
    });

    setSaved(true);
    setForm(initialForm);

    if (navigator.onLine) {
      await syncPendingRecords();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Administrador</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Nueva orden de trabajo</h2>
        </div>
        {saved && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Guardada localmente</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">Lote del viñedo</label>
          <input className="field" value={form.lote} onChange={(event) => handleChange('lote', event.target.value)} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Tarea</label>
          <select className="field" value={form.tarea} onChange={(event) => handleChange('tarea', event.target.value)}>
            <option>Poda</option>
            <option>Riego</option>
            <option>Cosecha</option>
            <option>Fertilización</option>
            <option>Control de plagas</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Insumos requeridos</label>
          <textarea className="field min-h-[100px]" value={form.insumos} onChange={(event) => handleChange('insumos', event.target.value)} />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Operario asignado</label>
          <input className="field" value={form.operario} onChange={(event) => handleChange('operario', event.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn-secondary mt-6 w-full">
        Crear orden de trabajo
      </button>
    </form>
  );
}

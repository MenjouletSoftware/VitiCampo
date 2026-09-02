'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getRoleLabel, getSession, loadAppData, saveAppData, type AppData } from '@/lib/appData';

const roleClass: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  operario: 'bg-emerald-100 text-emerald-800',
  supervisor: 'bg-amber-100 text-amber-800',
};

export function ProductDashboard() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setSession(getSession());
    setData(loadAppData());
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;

    const totalParcels = data.parcels.length;
    const pendingTasks = data.tasks.filter((task) => task.status !== 'Completada').length;
    const ordersOpen = data.orders.filter((order) => order.status !== 'Cerrada').length;
    const lowStock = data.inventory.filter((item) => item.stock <= item.threshold).length;

    return { totalParcels, pendingTasks, ordersOpen, lowStock };
  }, [data]);

  const handleTaskStatus = (taskId: number) => {
    if (!data) return;

    const nextData: AppData = {
      ...data,
      tasks: data.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: (task.status === 'Completada' ? 'Pendiente' : 'Completada') as AppData['tasks'][number]['status'],
              progress: task.status === 'Completada' ? 40 : 100,
            }
          : task,
      ),
    };

    setData(nextData);
    saveAppData(nextData);
  };

  const handleLogout = () => {
    localStorage.removeItem('viticampo-session');
    window.location.href = '/login';
  };

  if (!session || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-soft">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900 text-lg font-black text-white">V</div>
            <div>
              <p className="text-lg font-black text-purple-900">VitiCampo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-purple-900">Inicio</Link>
            <Link href="/dashboard/ia" className="text-sm font-semibold text-slate-700 hover:text-purple-900">IA</Link>
            <div className={`rounded-full px-3 py-1 text-xs font-bold ${roleClass[session.role]}`}>
              {getRoleLabel(session.role)}
            </div>
            <button type="button" onClick={handleLogout} className="btn-primary text-sm">
              Cerrar sesión
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-purple-900 to-violet-700 p-6 text-white shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-200">Panel operativo</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">Bienvenido, {session.name}</h1>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
              <div className="font-semibold">Próxima acción</div>
              <div className="mt-1 text-purple-100">{data.summary.nextAction}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Superficie</p>
            <p className="mt-3 text-3xl font-black text-purple-900">{data.summary.hectares} ha</p>
            <p className="mt-2 text-sm text-slate-600">Total administrado</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tareas abiertas</p>
            <p className="mt-3 text-3xl font-black text-emerald-700">{stats?.pendingTasks ?? 0}</p>
            <p className="mt-2 text-sm text-slate-600">Neceitan atención</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Órdenes vigentes</p>
            <p className="mt-3 text-3xl font-black text-amber-700">{stats?.ordersOpen ?? 0}</p>
            <p className="mt-2 text-sm text-slate-600">En ejecución</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stock bajo</p>
            <p className="mt-3 text-3xl font-black text-red-700">{stats?.lowStock ?? 0}</p>
            <p className="mt-2 text-sm text-slate-600">Productos alertados</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Parcelas</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Estado general del viñedo</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Online
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-semibold">Parcela</th>
                    <th className="pb-3 pr-4 font-semibold">Superficie</th>
                    <th className="pb-3 pr-4 font-semibold">Salud</th>
                    <th className="pb-3 pr-4 font-semibold">Riego</th>
                    <th className="pb-3 font-semibold">Producción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parcels.map((parcel) => (
                    <tr key={parcel.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4">
                        <div className="font-bold text-slate-900">{parcel.name}</div>
                        <div className="text-xs text-slate-500">{parcel.status}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{parcel.hectares} ha</td>
                      <td className="py-3 pr-4">
                        <div className="mb-1 text-slate-700">{parcel.health}%</div>
                        <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${parcel.health >= 80 ? 'bg-emerald-500' : parcel.health >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${parcel.health}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{parcel.irrigation}</td>
                      <td className="py-3 text-slate-700">{parcel.yield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Ahorro de agua</p>
              <p className="mt-3 text-4xl font-black text-slate-900">{data.summary.waterSavings}%</p>
              <p className="mt-2 text-sm text-slate-600">Respecto al periodo anterior</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Producción actual</p>
              <p className="mt-3 text-4xl font-black text-emerald-700">{data.summary.production}</p>
              <p className="mt-2 text-sm text-slate-600">Acumulado estimado</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Tareas</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Operación de campo</h2>
              </div>
              <Link href="/dashboard/ia" className="text-sm font-semibold text-purple-900 hover:underline">
                IA de salud
              </Link>
            </div>

            <div className="space-y-4">
              {data.tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{task.title}</p>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
                          {task.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{task.lote} · {task.assignee}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${task.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' : task.status === 'En curso' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Vence: {task.due}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${task.progress}%` }} />
                  </div>

                  {task.status !== 'Completada' && (
                    <button type="button" onClick={() => handleTaskStatus(task.id)} className="btn-secondary mt-3 w-full">
                      Marcar como completada
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Órdenes</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Trabajo en curso</h2>
            </div>

            <div className="space-y-3">
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">#{order.id} · {order.tarea}</p>
                      <p className="text-sm text-slate-600">{order.lote} · {order.operario}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${order.status === 'Cerrada' ? 'bg-emerald-100 text-emerald-700' : order.status === 'En proceso' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Insumos: {order.insumos}</p>
                  <p className="mt-2 text-xs text-slate-500">Creada: {order.createdAt}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Inventario</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Control de insumos</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-semibold">Insumo</th>
                    <th className="pb-3 pr-4 font-semibold">Stock</th>
                    <th className="pb-3 font-semibold">Umbral</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inventory.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3 pr-4 text-slate-700">{item.stock} {item.unit}</td>
                      <td className="py-3">
                        <span className={item.stock <= item.threshold ? 'font-bold text-red-700' : 'text-slate-700'}>
                          {item.threshold} {item.unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-900">Resumen ejecutivo</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Indicadores clave</h2>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Salud general</span>
                  <span>88%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Uso de riego</span>
                  <span>72%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: '72%' }} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Productividad</span>
                  <span>81%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: '81%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

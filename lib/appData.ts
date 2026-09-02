export type UserRole = 'admin' | 'operario' | 'supervisor';

export type AppSession = {
  email: string;
  name: string;
  role: UserRole;
  loginAt: string;
};

export type Parcel = {
  id: number;
  name: string;
  hectares: number;
  status: 'Saludable' | 'Atención' | 'Crítico';
  health: number;
  irrigation: string;
  yield: string;
};

export type Task = {
  id: number;
  title: string;
  assignee: string;
  lote: string;
  due: string;
  status: 'Pendiente' | 'En curso' | 'Completada';
  priority: 'Alta' | 'Media' | 'Baja';
  progress: number;
};

export type WorkOrder = {
  id: number;
  lote: string;
  tarea: string;
  operario: string;
  insumos: string;
  createdAt: string;
  status: 'Abierta' | 'En proceso' | 'Cerrada';
};

export type InventoryItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
  threshold: number;
};

export type AppData = {
  parcels: Parcel[];
  tasks: Task[];
  orders: WorkOrder[];
  inventory: InventoryItem[];
  summary: {
    hectares: number;
    waterSavings: number;
    production: string;
    nextAction: string;
  };
};

export const APP_STORAGE_KEY = 'viticampo-app-data';

export const defaultAppData: AppData = {
  parcels: [
    { id: 1, name: 'Lote Norte', hectares: 18.5, status: 'Saludable', health: 91, irrigation: 'Automático 3x/semana', yield: '4.8 tn/ha' },
    { id: 2, name: 'Lote Sur', hectares: 21.2, status: 'Atención', health: 76, irrigation: 'Manual + sensor', yield: '4.1 tn/ha' },
    { id: 3, name: 'Bloque Este', hectares: 14.8, status: 'Crítico', health: 62, irrigation: 'Revisión inmediata', yield: '3.4 tn/ha' },
    { id: 4, name: 'Parcela Alta', hectares: 11.3, status: 'Saludable', health: 88, irrigation: 'Programado', yield: '5.1 tn/ha' },
  ],
  tasks: [
    { id: 1, title: 'Poda del bloque 2', assignee: 'Martín Ruiz', lote: 'Lote Norte', due: 'Hoy', status: 'Pendiente', priority: 'Alta', progress: 30 },
    { id: 2, title: 'Monitoreo de riego', assignee: 'Ana Gómez', lote: 'Lote Sur', due: 'Mañana', status: 'En curso', priority: 'Media', progress: 64 },
    { id: 3, title: 'Inspección fitosanitaria', assignee: 'Lucas Ponce', lote: 'Bloque Este', due: 'Hoy', status: 'Pendiente', priority: 'Alta', progress: 18 },
    { id: 4, title: 'Registro de cosecha', assignee: 'María López', lote: 'Parcela Alta', due: 'Viernes', status: 'Completada', priority: 'Baja', progress: 100 },
  ],
  orders: [
    { id: 1001, lote: 'Lote Norte', tarea: 'Riego', operario: 'Martín Ruiz', insumos: 'Mangueras, sensores, fertilizante foliar', createdAt: '2026-08-21', status: 'En proceso' },
    { id: 1002, lote: 'Lote Sur', tarea: 'Control de plagas', operario: 'Ana Gómez', insumos: 'Insecticida, guantes, mascarillas', createdAt: '2026-08-22', status: 'Abierta' },
    { id: 1003, lote: 'Bloque Este', tarea: 'Poda', operario: 'Lucas Ponce', insumos: 'Tijeras, etiquetas, guantes', createdAt: '2026-08-23', status: 'Cerrada' },
  ],
  inventory: [
    { id: 1, name: 'Fertilizante nitrogenado', stock: 320, unit: 'kg', threshold: 220 },
    { id: 2, name: 'Insecticida foliar', stock: 48, unit: 'L', threshold: 60 },
    { id: 3, name: 'Guantes de trabajo', stock: 96, unit: 'pares', threshold: 80 },
    { id: 4, name: 'Etiquetas de lote', stock: 240, unit: 'unidades', threshold: 150 },
  ],
  summary: {
    hectares: 65.8,
    waterSavings: 17,
    production: '1.126 t',
    nextAction: 'Revisar lote crítico Este y ajustar riego',
  },
};

export function getSession(): AppSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('viticampo-session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}

export function loadAppData(): AppData {
  if (typeof window === 'undefined') return defaultAppData;

  const raw = localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultAppData));
    return defaultAppData;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      parcels: parsed.parcels ?? defaultAppData.parcels,
      tasks: parsed.tasks ?? defaultAppData.tasks,
      orders: parsed.orders ?? defaultAppData.orders,
      inventory: parsed.inventory ?? defaultAppData.inventory,
      summary: parsed.summary ?? defaultAppData.summary,
    };
  } catch {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultAppData));
    return defaultAppData;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
}

export function getRoleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: 'Administrador',
    operario: 'Operario',
    supervisor: 'Supervisor',
  };
  return labels[role];
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl font-black text-purple-900">V</div>
        <h1 className="mt-6 text-3xl font-black text-slate-900">Página no encontrada</h1>
        <p className="mt-3 text-slate-600">
          La ruta solicitada no existe o fue movida. Volvé al inicio para continuar con la operación.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex w-full justify-center">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

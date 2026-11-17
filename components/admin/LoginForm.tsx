"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mx-auto mt-16 max-w-sm rounded-3xl border border-line bg-panel p-6">
      <div className="text-center text-5xl">🔐</div>
      <h1 className="mt-3 text-center text-2xl font-bold">Panel del vendedor</h1>
      <p className="mt-1 text-center text-sm text-muted">Solo para el dueño de la tienda.</p>
      <label className="label mt-6" htmlFor="pw">Contraseña</label>
      <input id="pw" name="password" type="password" className="input" autoComplete="current-password" required autoFocus />
      {state?.error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-primary mt-5 w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

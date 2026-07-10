"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "Invalid credentials" ? "Usuario o contraseña incorrectos" : data.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-outline bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-tertiary";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-tactical-noise w-full max-w-md border-2 border-primary-container bg-surface-container">
        <div className="h-1 w-full bg-tertiary" />
        <div className="p-8">
          <div className="mb-6 text-center">
            <span className="material-symbols-outlined text-4xl text-tertiary">shield</span>
            <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">ACCESO RESTRINGIDO</h1>
            <p className="label-caps mt-1 text-on-surface-variant">Panel de Administración</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-caps mb-1.5 block text-on-surface-variant">Usuario</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="label-caps mb-1.5 block text-on-surface-variant">Contraseña</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className={inputCls}
              />
            </div>

            {error && (
              <div className="border border-error-container bg-error-container/20 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 border-2 border-tertiary bg-tertiary px-6 py-3 text-on-tertiary transition-colors hover:bg-tertiary-container disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span className="label-caps">{loading ? "Accediendo..." : "Entrar"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

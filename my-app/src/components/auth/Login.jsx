"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(form.username, form.password);
      router.replace("/metricas/bsc");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-32 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Iniciar sesión
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Usuario"
          className="w-full border rounded-lg px-3 py-2"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full border rounded-lg px-3 py-2"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-[#0D3B66] text-white py-2 rounded-lg font-medium hover:bg-[#0B3158] disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                ¿Tienes un código de registro?{" "}
                <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-[#0D3B66] font-medium hover:underline"
                >
                Crear cuenta
                </button>
            </p>
        </div>
    </div>
  );
}

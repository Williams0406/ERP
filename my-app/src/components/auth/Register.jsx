"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUsuario } from "@/lib/api";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    codigo: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUsuario(form);

      // UX: feedback breve y redirección
      setTimeout(() => {
        router.replace("/");
      }, 600);

    } catch (err) {
      const data = err.response?.data;

      /**
       * DRF puede devolver errores en varios formatos:
       * - { codigo: ["mensaje"] }
       * - { username: ["mensaje"] }
       * - { email: ["mensaje"] }
       * - { detail: "mensaje" }
       */
      let message = "No se pudo registrar el usuario";

      if (data) {
        if (data.codigo) {
          message = Array.isArray(data.codigo)
            ? data.codigo[0]
            : data.codigo;
        } else if (data.username) {
          message = Array.isArray(data.username)
            ? data.username[0]
            : data.username;
        } else if (data.email) {
          message = Array.isArray(data.email)
            ? data.email[0]
            : data.email;
        } else if (data.detail) {
          message = data.detail;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-32 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Registro
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="codigo"
          placeholder="Código de registro"
          className="w-full border rounded-lg px-3 py-2"
          value={form.codigo}
          onChange={handleChange}
          required
        />

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
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-[#22A699] text-white py-2 rounded-lg font-medium hover:bg-[#1C8F84] disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

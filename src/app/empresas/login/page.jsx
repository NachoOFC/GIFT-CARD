"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmpresaLogin() {
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/empresas/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Guardar sesión empresa en localStorage
        const empresaData = { ...data.data, tipo: "empresa" };
        localStorage.setItem("empresaSession", JSON.stringify(empresaData));
        router.push("/empresas/home");
      } else {
        setError(data.message || "Error en el login");
      }
    } catch (err) {
      setError("Error en el servidor");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Login Empresa</h2>
        <input
          type="text"
          name="rut"
          value={rut}
          onChange={e => setRut(e.target.value)}
          placeholder="RUT (12345678-9)"
          className="border rounded-lg px-4 py-3"
        />
        <div className="text-center text-gray-500 text-sm">o</div>
        <input
          type="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email empresa"
          className="border rounded-lg px-4 py-3"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="border rounded-lg px-4 py-3"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </form>
    </div>
  );
}

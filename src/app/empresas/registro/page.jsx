"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  nombre: "",
  rut: "",
  email: "",
  telefono: "",
  direccion: "",
  ciudad: "",
  region: "Chile",
  pais: "Chile",
  contacto_nombre: "",
  contacto_email: "",
  contacto_telefono: "",
  servicio_contacto: "",
  logo_url: "",
  password: "",
};

const regiones = ["Chile", "Argentina", "Perú", "Colombia", "México", "España", "Otro"];

export default function RegistroEmpresa() {
  const [form, setForm] = useState(initialState);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "rut") {
      const rutRegex = /^\d{7,8}-[\dkK]$/;
      if (!rutRegex.test(value)) {
        setError("El RUT debe tener formato 12345678-9");
      } else {
        setError("");
      }
    }
    setForm({ ...form, [name]: value });
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/empresas/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Empresa registrada correctamente");
        setForm(initialState);
        setStep(1);
        setTimeout(() => router.push("/empresas/login"), 1200);
      } else {
        setError(data.message || "Error en el registro");
      }
    } catch (err) {
      setError("Error en el registro");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <main className="w-full max-w-5xl flex flex-row items-start justify-center gap-0 px-0 py-0">
        {/* Formulario */}
        <section className="w-full md:w-1/2 flex flex-col items-start justify-center px-12 py-16">
          <h2 className="text-3xl font-semibold mb-8 text-gray-900">Comencemos</h2>
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="w-full max-w-md space-y-8">
            {step === 1 && (
              <>
                <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-lg focus:outline-none focus:border-blue-500" placeholder="Nombre de la empresa" required />
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-3">Cantidad de empleados, incluido usted</label>
                  <div className="space-y-3">
                    {["Solo tú", "Entre 2 y 9", "Entre 10 y 99", "Entre 100 y 299", "Más de 300"].map((opt) => (
                      <label key={opt} className="flex items-center gap-3 text-lg">
                        <input type="radio" name="empleados" value={opt} checked={form.empleados === opt} onChange={handleChange} required className="w-5 h-5 accent-blue-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-3">Región *</label>
                  <select name="region" value={form.region} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-500">
                    {regiones.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={nextStep} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition">Siguiente</button>
              </>
            )}
            {step === 2 && (
              <>
                <input name="rut" value={form.rut} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="RUT de la empresa (formato: 12345678-9)" required pattern="^\d{7,8}-[\dkK]$" title="Ejemplo: 12345678-9" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Correo empresa" required />
                <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Teléfono" inputMode="numeric" pattern="^\d+$" title="Solo números" />
                <input name="direccion" value={form.direccion} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Dirección" />
                <input name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Ciudad" />
                <input name="pais" value={form.pais} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="País" />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold text-base">Atrás</button>
                  <button type="button" onClick={nextStep} className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition">Siguiente</button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <input name="contacto_nombre" value={form.contacto_nombre} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Nombre contacto servicio" />
                <input name="contacto_email" type="email" value={form.contacto_email} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Email contacto servicio" />
                <input name="contacto_telefono" value={form.contacto_telefono} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Teléfono contacto servicio" inputMode="numeric" pattern="^\d+$" title="Solo números" />
                <input name="servicio_contacto" value={form.servicio_contacto} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Servicio de contacto (soporte)" />
                <input name="logo_url" value={form.logo_url} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="URL logo (opcional)" />
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-base focus:outline-none focus:border-blue-400" placeholder="Contraseña" required />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={prevStep} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-semibold text-base">Atrás</button>
                  <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold text-base hover:bg-blue-600 transition" disabled={loading}>
                    {loading ? "Registrando..." : "Registrar empresa"}
                  </button>
                </div>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
              </>
            )}
          </form>
        </section>
        {/* Lado derecho informativo */}
        <aside className="w-full md:w-1/2 flex flex-col items-center justify-center px-12 py-16">
          <img src="/logo/mline.jpg" alt="Ilustración" className="w-32 h-32 mb-6 rounded-xl shadow" />
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs mb-2">Función incluida</span>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Obtén una dirección de correo electrónico personalizada para tu empresa</h3>
          <p className="text-gray-600 text-center mb-2 text-lg">Genera confianza y reconocimiento con una dirección personalizada del tipo <b>@tuempresa</b> y herramientas profesionales de marketing por correo electrónico.</p>
        </aside>
      </main>
    </div>
  );
}

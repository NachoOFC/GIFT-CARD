"use client";
import { useMemo, useState } from "react";

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i];
    });
    return obj;
  });
  return { headers, rows };
}

export default function EmpresasBulkPage() {
  const [empresa, setEmpresa] = useState("Panichini");
  const [parsed, setParsed] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [emailNotify, setEmailNotify] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "info", ms = 4000) => {
    setToast({ message, type });
    if (typeof window !== "undefined") {
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(() => setToast({ message: "", type: "" }), ms);
    }
  };

  const requiredCols = useMemo(
    () => ["codigo", "valor_inicial", "email_destinatario"],
    []
  );

  const missingRequired = useMemo(() => {
    if (!parsed.headers || parsed.headers.length === 0) return requiredCols;
    return requiredCols.filter((c) => !parsed.headers.includes(c));
  }, [parsed.headers, requiredCols]);

  const onFile = async (file) => {
    const text = await file.text();
    const p = parseCsv(text);
    setParsed(p);
    setResult(null);
    setError(null);
  };

  const resetAll = () => {
    setParsed({ headers: [], rows: [] });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/corporate/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa, items: parsed.rows }),
      });
      const data = await res.json();
      if (res.status === 409) {
        const conflicts = data?.conflicts || [];
        const sample = conflicts.slice(0, 3).map((c) => c.codigo).join(", ");
        const suffix = conflicts.length > 3 ? ` y ${conflicts.length - 3} más` : "";
        showToast(`Algunos códigos ya existen: ${sample}${suffix}`, "warning");
        setError(null);
      } else if (!res.ok || !data.success) {
        showToast(data?.message || "Error al procesar el lote", "error");
        setError(null);
      } else {
        setResult(data);
        const skipped = data?.skipped || 0;
        const inserted = data?.inserted || data?.results?.length || 0;
        if (skipped > 0) {
          showToast(`Insertadas ${inserted}. Omitidas ${skipped} por conflicto.`, "warning");
        } else {
          showToast(`Lote creado correctamente (${inserted})`, "success");
        }
      }
    } catch (e) {
      showToast("Error de red", "error");
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Portal Empresas
          </h1>
          <p className="text-gray-600 mt-1">
            Compra masiva y asignación de Gift Cards a colaboradores.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Paso 1: Datos y archivo
                </h2>
                <p className="text-sm text-gray-500">
                  Seleccione la empresa y cargue el archivo CSV.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  CSV
                </span>
                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  Lote
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                 <div className="text-gray-900 font-medium">
      {empresa}
    </div>
                {parsed.rows.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Bloqueado tras cargar el archivo.
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargar CSV
                </label>
                <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl mb-1">📄</div>
                    <div className="text-sm text-gray-700">
                      Haga clic para seleccionar el archivo CSV
                    </div>
                    <div className="text-xs text-gray-500">o arrástrelo aquí</div>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                      e.target.files && e.target.files[0] && onFile(e.target.files[0])
                    }
                    className="hidden"
                  />
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Cabeceras esperadas:</span>
                  {["codigo", "valor_inicial", "email_destinatario", "fecha_expiracion", "mensaje"].map(
                    (h) => (
                      <span
                        key={h}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {h}
                      </span>
                    )
                  )}
                  <a
                    href="/publico-plantillas/plantilla_bulk.csv"
                    className="ml-auto text-xs text-blue-600 hover:underline"
                  >
                    Descargar plantilla
                  </a>
                </div>
              </div>
            </div>
          </div>

          {parsed.rows.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-5 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Paso 2: Revisar y confirmar
                  </h2>
                  <p className="text-sm text-gray-500">
                    Revise la vista previa y confirme el envío.
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-gray-100">
                      Registros: {parsed.rows.length}
                    </span>
                    <span className="px-2 py-1 rounded-md bg-gray-100">
                      Monto total: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
                        parsed.rows.reduce((acc, r) => acc + (Number(r.valor_inicial) || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {missingRequired.length > 0 && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
                  Faltan columnas requeridas: {missingRequired.join(", ")}
                </div>
              )}
              <div className="overflow-auto border rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {parsed.headers.map((h) => (
                        <th key={h} className="text-left px-3 py-2 border-b">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 200).map((row, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-gray-50">
                        {parsed.headers.map((h) => (
                          <td key={h} className="px-3 py-2 border-b whitespace-nowrap">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="notify"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={emailNotify}
                    onChange={(e) => setEmailNotify(e.target.checked)}
                  />
                  <label htmlFor="notify" className="text-sm text-gray-700">
                    Enviar email a beneficiarios (pendiente de implementación)
                  </label>
                </div>
                <div className="md:ml-auto flex items-center gap-3">
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                  >
                    Reiniciar
                  </button>
                  <button
                    disabled={loading || missingRequired.length > 0}
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded-lg text-white ${
                      loading || missingRequired.length > 0
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Procesando…" : "Crear Gift Cards en Lote"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Se eliminó el panel de error, los mensajes se muestran por toast */}

          
        </div>
      </div>
      {toast?.message && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg px-4 py-3 text-sm text-white ${
            toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "warning"
              ? "bg-amber-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-gray-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}


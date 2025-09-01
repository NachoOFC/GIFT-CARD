import { VIGENCIA_DEFECTO, VIGENCIA_MAX, MONTOS_SUGERIDOS, MONTO_MIN, MONTO_MAX, MONTO_STEP, formatCLP } from "@/types/type";
import { useState } from "react";

export default function AdminParametros() {
  const [vigenciaDefecto, setVigenciaDefecto] = useState(VIGENCIA_DEFECTO);
  const [vigenciaMax, setVigenciaMax] = useState(VIGENCIA_MAX);
  const [montos, setMontos] = useState(MONTOS_SUGERIDOS);
  const [min, setMin] = useState(MONTO_MIN);
  const [max, setMax] = useState(MONTO_MAX);
  const [step, setStep] = useState(MONTO_STEP);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Parámetros Gift Card</h2>
      <div className="mb-2">
        <label>Vigencia por defecto (días): </label>
        <input type="number" value={vigenciaDefecto} onChange={e => setVigenciaDefecto(Number(e.target.value))} className="border px-2 py-1 rounded"/>
      </div>
      <div className="mb-2">
        <label>Vigencia máxima (días): </label>
        <input type="number" value={vigenciaMax} onChange={e => setVigenciaMax(Number(e.target.value))} className="border px-2 py-1 rounded"/>
      </div>
      <div className="mb-2">
        <label>Monto mínimo: </label>
        <input type="number" value={min} onChange={e => setMin(Number(e.target.value))} className="border px-2 py-1 rounded"/>
      </div>
      <div className="mb-2">
        <label>Monto máximo: </label>
        <input type="number" value={max} onChange={e => setMax(Number(e.target.value))} className="border px-2 py-1 rounded"/>
      </div>
      <div className="mb-2">
        <label>Step: </label>
        <input type="number" value={step} onChange={e => setStep(Number(e.target.value))} className="border px-2 py-1 rounded"/>
      </div>
      <div className="mb-2">
        <label>Montos sugeridos:</label>
        <ul>
          {montos.map((m, i) => (
            <li key={i}>{m.nombre}: {formatCLP(m.monto)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

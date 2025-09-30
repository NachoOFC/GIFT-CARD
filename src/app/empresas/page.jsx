"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmpresasEntry() {
	const [showRegistro, setShowRegistro] = useState(false);
	const router = useRouter();
	const [empresaLogeada, setEmpresaLogeada] = useState(false);

	if (empresaLogeada) {
		router.push("/empresas/home");
		return null;
	}

	if (showRegistro) {
		const Registro = require("./registro/page.jsx").default;
		return <Registro />;
	}

	return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 animate-fadein">
				<div className="bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-8 border border-blue-200">
					{/* Botón Volver al home principal */}
					<button
						onClick={() => router.push("/home")}
						className="absolute left-6 top-6 px-3 py-1 bg-blue-100 text-blue-700 rounded font-semibold hover:bg-blue-200 text-xs flex items-center gap-1"
						style={{ zIndex: 10 }}
					>
						<span className="text-lg">←</span> Volver
					</button>
					<div className="flex flex-col items-center gap-2">
						<img src="/logo/mline.jpg" alt="Logo empresa" className="w-24 h-24 rounded-xl shadow-lg mb-2 border-4 border-blue-300" />
						<h1 className="text-3xl font-extrabold text-blue-700 mb-1 tracking-tight">Bienvenido a Gift Card Empresas</h1>
						<p className="text-gray-600 text-center mb-2">Gestiona tus campañas, crea y administra gift cards corporativas en un solo lugar.</p>
					</div>
				<div className="flex flex-col gap-4 mt-4">
					<button
						className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
						onClick={() => router.push("/empresas/login")}
					>
						Ingresar como empresa
					</button>
					<div className="text-center text-gray-500 text-sm">¿No tienes cuenta?</div>
					<button
						className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
						onClick={() => setShowRegistro(true)}
					>
						Registrar empresa
					</button>
				</div>
				<div className="flex justify-center mt-6">
					<span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold shadow">Plataforma segura y profesional</span>
				</div>
			</div>
			<style jsx>{`
				.animate-fadein {
					animation: fadein 1.2s;
				}
				@keyframes fadein {
					from { opacity: 0; transform: scale(0.98); }
					to { opacity: 1; transform: scale(1); }
				}
			`}</style>
		</div>
	);
}

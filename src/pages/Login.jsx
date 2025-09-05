import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAccessKey } from "../services/api";
import {
    Eye, EyeOff, ClipboardList, Sparkles, Heart, Zap, CheckCircle2,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [key, setKey] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const existing = sessionStorage.getItem("nursia_access_key");
        if (existing) navigate("/dashboard");
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        const { ok, error } = await verifyAccessKey(key.trim());
        setLoading(false);

        if (!ok) {
            setErr(error || "Chave inválida");
            return;
        }
        sessionStorage.setItem("nursia_access_key", key.trim());
        navigate("/dashboard");
    }

    return (
        <div className="relative min-h-screen bg-white">
            {/* Fundo suave */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-16 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl"/>
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl"/>
            </div>

            {/* Conteúdo centralizado com padding generoso */}
            <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 md:px-12 lg:px-20 py-12">
                <div className="grid w-full gap-12 md:grid-cols-2 md:items-center">
                    {/* ESQUERDA — oculta em telas pequenas */}
                    <div className="hidden md:flex flex-col justify-center space-y-6">
                        <div className="mb-2 inline-flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600"/>
                            <span className="text-2xl font-semibold text-gray-900">Nursia</span>
                        </div>

                        <h1 className="text-4xl font-semibold leading-tight text-gray-900">
                            Bem-vindo à{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Nursia
                            </span>
                        </h1>
                        <p className="max-w-md text-base leading-relaxed text-gray-700">
                            Uma plataforma feita para apoiar a prática de enfermagem no CAPS — informações essenciais e foco no cuidado ao paciente.
                        </p>

                        {/* Features modernas (com ícones Lucide) */}
                        <div className="mt-6 grid grid-cols-2 gap-6">
                            <Feature
                                icon={<ClipboardList size={18}/>}
                                title="Informações essenciais"
                                desc="Acesso direto ao que você precisa para o cuidado."
                                color="from-blue-500 to-indigo-500"
                            />
                            <Feature
                                icon={<Sparkles size={18}/>}
                                title="Clareza"
                                desc="Tela limpa e fácil de navegar."
                                color="from-pink-500 to-rose-500"
                            />
                            <Feature
                                icon={<Heart size={18}/>}
                                title="Apoio ao cuidado"
                                desc="Facilita o acompanhamento do paciente."
                                color="from-green-500 to-emerald-500"
                            />
                            <Feature
                                icon={<Zap size={18}/>}
                                title="Praticidade"
                                desc="Rápido para o dia a dia na unidade."
                                color="from-yellow-500 to-orange-500"
                            />
                        </div>
                    </div>

                    {/* DIREITA — Card de login */}
                    <div className="mx-auto w-full max-w-md">
                        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
                            <header className="mb-6 text-center">
                                <h2 className="text-2xl font-semibold text-gray-900">Entrar</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Digite sua <span className="font-medium text-gray-900">chave de acesso</span> para continuar.
                                </p>
                            </header>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-700">
                                        Chave de acesso
                                    </span>
                                    <div className="relative">
                                        <input
                                            type={show ? "text" : "password"}
                                            required
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShow((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            aria-label={show ? "Ocultar chave" : "Mostrar chave"}
                                        >
                                            {show ? <EyeOff size={20}/> : <Eye size={20}/>}
                                        </button>
                                    </div>
                                </label>

                                {err && (
                                    <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {err}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {loading ? "Entrando..." : "Entrar"}
                                </button>
                            </form>

                            {/* Divisor */}
                            <div className="my-6 flex items-center gap-4">
                                <span className="h-px flex-1 bg-gray-200"/>
                                <span className="text-xs uppercase tracking-wide text-gray-400">nursia</span>
                                <span className="h-px flex-1 bg-gray-200"/>
                            </div>

                            {/* Checklist com mensagens relevantes (ícone Lucide) */}
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="mt-0.5 text-green-600"/>
                                    <span>Somente dados de enfermagem ficam disponíveis.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="mt-0.5 text-green-600"/>
                                    <span>Facilidade para acompanhar histórico do paciente.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 size={16} className="mt-0.5 text-green-600"/>
                                    <span>Conteúdo organizado para apoiar seu trabalho diário.</span>
                                </li>
                            </ul>

                            <p className="mt-6 text-center text-xs text-gray-500">
                                © {new Date().getFullYear()} Nursia — Apoio ao cuidado em enfermagem
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- Component auxiliar --- */
function Feature({ icon, title, desc, color }) {
    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
                {icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
    );
}

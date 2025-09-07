import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();
    const isLogged = useMemo(() => !!sessionStorage.getItem("nursia_access_key"), []);

    function handleLogout() {
        sessionStorage.removeItem("nursia_access_key");
        sessionStorage.removeItem("nursia_admin_key"); // importante se estiver usando permissões de admin
        sessionStorage.removeItem("nursia_role");      // opcional, caso exista
        navigate("/login");
    }

    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/70 bg-white/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
                {/* Brand (Logo SVG + wordmark) */}
                <div
                    onClick={() => navigate("/dashboard")}
                    className="flex cursor-pointer items-center gap-2"
                    title="Nursia — Dashboard"
                >
                    {/* Ícone (SVG) */}
                    <svg
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        role="img"
                    >
                        <defs>
                            <linearGradient id="nursia-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#2563EB"/>
                                <stop offset="1" stopColor="#7C3AED"/>
                            </linearGradient>
                            <filter id="nursia-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25"/>
                            </filter>
                        </defs>

                        {/* Placa arredondada com gradiente */}
                        <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#nursia-g)" filter="url(#nursia-shadow)"/>

                        {/* Cruz médica (branca) */}
                        <path
                            d="M27 16h-6v5h-5v6h5v5h6v-5h5v-6h-5v-5z"
                            fill="#FFFFFF"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />

                        {/* Linha sutil (batimento) */}
                        <path
                            d="M12 31c4.5-1.2 8.5-1.2 13 0 4.5 1.2 8.5 1.2 13 0"
                            stroke="#FFFFFF"
                            strokeOpacity="0.5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />

                        {/* Brilhos */}
                        <circle cx="34" cy="14" r="1.8" fill="#FFFFFF" fillOpacity="0.9"/>
                        <circle cx="16" cy="12" r="1.2" fill="#FFFFFF" fillOpacity="0.75"/>
                    </svg>

                    {/* Wordmark (opcional; aparece de sm pra cima) */}
                    <span className="hidden sm:inline text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Nursia
                    </span>

                    <span className="sr-only">Nursia</span>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-gray-700 sm:inline-flex">
                    <ShieldCheck size={14} className="text-emerald-600"/>
                    Acesso de Enfermagem
                </span>
                    {isLogged && (
                        <button
                            onClick={handleLogout}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white/70 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-white"
                            title="Sair"
                        >
                            <LogOut size={16}/>
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

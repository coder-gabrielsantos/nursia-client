import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();
    const isLogged = useMemo(() => !!sessionStorage.getItem("nursia_access_key"), []);

    function handleLogout() {
        sessionStorage.removeItem("nursia_access_key");
        sessionStorage.removeItem("nursia_admin_key"); // remove também admin se existir
        navigate("/login");
    }

    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/70 bg-white/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
                {/* Brand (Logo + wordmark) */}
                <div
                    onClick={() => navigate("/dashboard")}
                    className="flex cursor-pointer items-center gap-2"
                    title="Nursia — Dashboard"
                >
                    {/* SVG premium */}
                    <svg
                        className="h-8 w-8 sm:h-9 sm:w-9"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-labelledby="nursiaLogoTitle nursiaLogoDesc"
                    >
                        <title id="nursiaLogoTitle">Nursia</title>
                        <desc id="nursiaLogoDesc">
                            Ícone com placa arredondada em gradiente, cruz médica central e linha de ECG.
                        </desc>

                        <defs>
                            <linearGradient id="nursia-gradient" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#2563EB"/>
                                <stop offset="1" stopColor="#7C3AED"/>
                            </linearGradient>
                            <linearGradient id="nursia-gloss" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35"/>
                                <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.12"/>
                                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
                            </linearGradient>
                            <filter id="nursia-shadow" x="-40%" y="-40%" width="180%" height="180%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodOpacity="0.25"/>
                            </filter>
                        </defs>

                        {/* Placa */}
                        <rect x="6" y="6" width="52" height="52" rx="14"
                              fill="url(#nursia-gradient)" filter="url(#nursia-shadow)"/>
                        <rect x="6.5" y="6.5" width="51" height="51" rx="13.5"
                              stroke="#FFFFFF" strokeOpacity="0.14"/>

                        {/* Cruz */}
                        <path d="M36 20h-8v6h-6v8h6v6h8v-6h6v-8h-6v-6z"
                              fill="#FFFFFF" fillRule="evenodd" clipRule="evenodd"/>

                        {/* ECG */}
                        <path
                            d="M10 41 C16 39.8,22 39.8,28 41 l4 -8 l6 16 l6 -12 l4 6 H54"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeOpacity="0.95"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Brilho */}
                        <rect x="6" y="6" width="52" height="26" rx="14" fill="url(#nursia-gloss)"/>
                        <circle cx="44" cy="16" r="2" fill="#FFFFFF" fillOpacity="0.9"/>
                        <circle cx="20" cy="14" r="1.4" fill="#FFFFFF" fillOpacity="0.75"/>
                    </svg>

                    {/* Texto (desktop) */}
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

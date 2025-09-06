import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ShieldCheck, LogOut } from "lucide-react";

export default function Navbar() {
    const navigate = useNavigate();
    const isLogged = useMemo(() => !!sessionStorage.getItem("nursia_access_key"), []);

    function handleLogout() {
        sessionStorage.removeItem("nursia_access_key");
        sessionStorage.removeItem("nursia_admin_key"); // <- importante
        sessionStorage.removeItem("nursia_role");      // <- opcional
        navigate("/login");
    }

    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/70 bg-white/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
                {/* Brand */}
                <div
                    onClick={() => navigate("/dashboard")}
                    className="flex cursor-pointer items-center gap-2"
                >
                    <span className="text-xl font-bold text-gray-900">Nursia</span>
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

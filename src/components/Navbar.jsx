import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import ChangePasswordsModal from "./ChangePasswordsModal";

export default function Navbar() {
    const navigate = useNavigate();
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const isLogged = !!sessionStorage.getItem("nursia_role_key");
    const isCapsAccess = sessionStorage.getItem("nursia_role") === "enfermeiro-caps";

    function handleLogout() {
        sessionStorage.removeItem("nursia_role_key");
        sessionStorage.removeItem("nursia_role");
        navigate("/login");
    }

    return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/70 bg-white/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
                <div
                    onClick={() => navigate("/dashboard")}
                    className="flex cursor-pointer items-center gap-2"
                    title="Nursia — Dashboard"
                >
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-xl md:text-2xl">
                        Nursia
                    </span>
                    <span className="sr-only">Nursia</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden items-center gap-1 rounded-xl border border-gray-200 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-gray-700 sm:inline-flex">
                        <ShieldCheck size={14} className="text-emerald-600"/>
                        Acesso de Enfermagem
                    </span>

                    {isCapsAccess && (
                        <button
                            type="button"
                            onClick={() => setPasswordModalOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            title="Alterar senhas de acesso"
                        >
                            <KeyRound size={16}/>
                            <span className="hidden md:inline">Alterar senhas</span>
                            <span className="sr-only md:hidden">Alterar senhas</span>
                        </button>
                    )}

                    {isLogged && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white/70 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-white"
                            title="Sair"
                        >
                            <LogOut size={16}/>
                            <span className="hidden sm:inline">Sair</span>
                            <span className="sr-only sm:hidden">Sair</span>
                        </button>
                    )}
                </div>
            </div>

            <ChangePasswordsModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
            />
        </header>
    );
}

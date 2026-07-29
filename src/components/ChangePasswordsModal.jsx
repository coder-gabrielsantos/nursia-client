import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, X } from "lucide-react";
import Modal from "./Modal";
import { changeAccessPasswords } from "../services/api";

export default function ChangePasswordsModal({ open, onClose }) {
    const [capsPassword, setCapsPassword] = useState("");
    const [capsConfirmation, setCapsConfirmation] = useState("");
    const [unidadePassword, setUnidadePassword] = useState("");
    const [unidadeConfirmation, setUnidadeConfirmation] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function resetFeedback() {
        setError("");
        setSuccess("");
    }

    function handleClose() {
        if (saving) return;
        setCapsPassword("");
        setCapsConfirmation("");
        setUnidadePassword("");
        setUnidadeConfirmation("");
        resetFeedback();
        onClose();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        resetFeedback();

        const nextCapsPassword = capsPassword.trim();
        const nextUnidadePassword = unidadePassword.trim();

        if (!nextCapsPassword && !nextUnidadePassword) {
            setError("Informe ao menos uma senha para alterar.");
            return;
        }
        if ([nextCapsPassword, nextUnidadePassword].filter(Boolean).some((password) => password.length < 4)) {
            setError("As senhas devem ter pelo menos 4 caracteres.");
            return;
        }
        if (nextCapsPassword && nextCapsPassword !== capsConfirmation.trim()) {
            setError("A confirmação da senha CAPS não confere.");
            return;
        }
        if (nextUnidadePassword && nextUnidadePassword !== unidadeConfirmation.trim()) {
            setError("A confirmação da senha da unidade não confere.");
            return;
        }
        if (nextCapsPassword && nextUnidadePassword && nextCapsPassword === nextUnidadePassword) {
            setError("Use senhas diferentes para os dois acessos.");
            return;
        }

        try {
            setSaving(true);
            const data = await changeAccessPasswords({
                capsPassword: nextCapsPassword || undefined,
                unidadePassword: nextUnidadePassword || undefined,
            });

            if (data?.roleKey) {
                sessionStorage.setItem("nursia_role_key", data.roleKey);
            }

            setCapsPassword("");
            setCapsConfirmation("");
            setUnidadePassword("");
            setUnidadeConfirmation("");
            setSuccess("Senhas alteradas com sucesso.");
        } catch (requestError) {
            setError(
                requestError?.response?.data?.error
                || "Não foi possível alterar as senhas."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} onClose={handleClose} ariaLabel="Alterar senhas">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <KeyRound size={20} />
                        </span>
                        <div>
                            <h2 className="font-semibold text-gray-900">Alterar senhas</h2>
                            <p className="text-xs text-gray-500">Deixe em branco o acesso que não será alterado.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5 px-5 py-5">
                    <PasswordGroup
                        label="Acesso CAPS"
                        password={capsPassword}
                        confirmation={capsConfirmation}
                        onPasswordChange={(value) => {
                            setCapsPassword(value);
                            resetFeedback();
                        }}
                        onConfirmationChange={(value) => {
                            setCapsConfirmation(value);
                            resetFeedback();
                        }}
                        disabled={saving}
                    />

                    <PasswordGroup
                        label="Acesso da unidade"
                        password={unidadePassword}
                        confirmation={unidadeConfirmation}
                        onPasswordChange={(value) => {
                            setUnidadePassword(value);
                            resetFeedback();
                        }}
                        onConfirmationChange={(value) => {
                            setUnidadeConfirmation(value);
                            resetFeedback();
                        }}
                        disabled={saving}
                    />

                    {error && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            <CheckCircle2 size={17} />
                            {success}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={saving}
                        className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Fechar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function PasswordGroup({
    label,
    password,
    confirmation,
    onPasswordChange,
    onConfirmationChange,
    disabled,
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                {label}
            </legend>
            <PasswordInput
                value={password}
                onChange={onPasswordChange}
                placeholder="Nova senha"
                show={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
                disabled={disabled}
            />
            <PasswordInput
                value={confirmation}
                onChange={onConfirmationChange}
                placeholder="Confirmar nova senha"
                show={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
                disabled={disabled}
            />
        </fieldset>
    );
}

function PasswordInput({ value, onChange, placeholder, show, onToggle, disabled }) {
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                autoComplete="new-password"
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={onToggle}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}

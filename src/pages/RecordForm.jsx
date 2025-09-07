import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { createRecord, getRecord, updateRecord } from "../services/api.js";
import InfoDialog from "../components/InfoDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import useRecordDraft, { createDraft } from "../hooks/useRecordDraft.js";
import RecordFormFields from "../components/RecordFormFields.jsx";
import { Check, ArrowLeft } from "lucide-react";

// >>> NOVO: helpers e mapeamentos centralizados
import {
    brToISO,
    serverToForm,
    formToServer,
} from "../lib/recordForm.shared.js";

/* --------------------------------- Página --------------------------------- */
export default function RecordForm({ mode = "create" }) {
    const { draftId, id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Evita criação dupla em StrictMode
    const createdRef = useRef(false);

    // CREATE: se não houver draftId, cria e navega (preservando state/autofill)
    useEffect(() => {
        if (createdRef.current) return;
        if (mode === "create" && !draftId) {
            createdRef.current = true;
            const newId = createDraft();
            navigate(`/records/new/${newId}`, { replace: true, state: location.state });
        }
    }, [mode, draftId, navigate, location.state]);

    // EDIT: não criar rascunho — só segue
    if (mode === "create" && !draftId) return null;

    return mode === "edit" ? (
        <FormEdit recordId={id}/>
    ) : (
        <FormCreate draftId={draftId}/>
    );
}

/* ----------------------------- Fluxo: CREATE ------------------------------ */
function FormCreate({ draftId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { draft, setDraft, updateData, suspendAutosave, removeDraft } =
        useRecordDraft(draftId);

    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    // === AUTOFILL (via navigate state, vindo do ScanDoc) ===
    // Normaliza data DD/MM/AAAA -> YYYY-MM-DD antes de aplicar
    const autofillApplied = useRef(false);
    useEffect(() => {
        if (autofillApplied.current) return;
        if (!draft?.id) return;

        const obj = location.state?.autofill;
        if (!obj) return;

        const normalized = {
            ...obj,
            dataAtendimento:
                typeof obj.dataAtendimento === "string" &&
                /^\d{2}\/\d{2}\/\d{4}$/.test(obj.dataAtendimento)
                    ? brToISO(obj.dataAtendimento)
                    : obj.dataAtendimento,
        };

        setDraft((prev) => ({
            ...prev,
            data: { ...(prev?.data || {}), ...normalized },
        }));

        autofillApplied.current = true;
        // Opcional: limpar o state se quiser
        // navigate(".", { replace: true, state: {} });
    }, [draft?.id, location.state, setDraft]);

    if (!draft) {
        return (
            <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-10 py-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    Rascunho não encontrado.
                </div>
            </div>
        );
    }

    async function finish() {
        setSubmitErr("");
        setSubmitting(true);
        try {
            suspendAutosave();
            const data = draft?.data || {};
            await createRecord(formToServer(data)); // cria (mapeamento centralizado)
            setOpenSuccess(true);
        } catch (e) {
            const msg =
                e?.response?.data?.error || e?.message || "Falha ao salvar o prontuário";
            setSubmitErr(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <BaseFormLayout
            title="Novo prontuário"
            idHint={draft.id}
            progress={100}
            submitErr={submitErr}
            footer={
                <FooterSingle
                    submitting={submitting}
                    onFinish={finish}
                    onCancel={() => navigate("/dashboard")}
                />
            }
        >
            <RecordFormFields
                value={draft.data}
                onChange={(patch) => updateData(patch)}
                showSectionTitles={true}
            />

            <InfoDialog
                open={openSuccess}
                onClose={() => {
                    removeDraft();
                    setOpenSuccess(false);
                    navigate("/dashboard");
                }}
                title="Prontuário criado"
                message="O prontuário foi criado com sucesso."
                okText="Ir para o painel"
                variant="success"
            />
        </BaseFormLayout>
    );
}

/* ------------------------------ Fluxo: EDIT ------------------------------- */
function FormEdit({ recordId }) {
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openSaved, setOpenSaved] = useState(false);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);
                const rec = await getRecord(recordId);
                if (on) setData(serverToForm(rec)); // mapeamento centralizado
            } catch {
                if (on) setErr("Não foi possível carregar este prontuário.");
            } finally {
                if (on) setLoading(false);
            }
        })();
        return () => {
            on = false;
        };
    }, [recordId]);

    async function finish() {
        setSubmitErr("");
        setSubmitting(true);
        try {
            await updateRecord(recordId, formToServer(data || {})); // update (centralizado)
            setOpenSuccess(true);
        } catch (e) {
            const msg =
                e?.response?.data?.error || e?.message || "Falha ao salvar o prontuário";
            setSubmitErr(msg);
        } finally {
            setSubmitting(false);
        }
    }

    async function saveNow() {
        setSubmitErr("");
        setSubmitting(true);
        try {
            await updateRecord(recordId, formToServer(data || {}));
            setOpenSaved(true);
        } catch (e) {
            const msg =
                e?.response?.data?.error || e?.message || "Falha ao salvar o prontuário";
            setSubmitErr(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <BaseFormLayout
            title="Editar prontuário"
            idHint={recordId}
            progress={100}
            submitErr={submitErr}
            loading={loading}
            err={err}
            footer={
                <FooterSingle
                    submitting={submitting}
                    onFinish={finish}
                    onSave={saveNow}
                    isEdit
                    onCancel={() => navigate(`/records/${recordId}`)}
                />
            }
        >
            {!!data && (
                <RecordFormFields
                    value={data}
                    onChange={(patch) => setData((d) => ({ ...(d || {}), ...patch }))}
                    showSectionTitles={true}
                />
            )}

            <InfoDialog
                open={openSuccess}
                onClose={() => {
                    setOpenSuccess(false);
                    navigate(`/records/${recordId}`);
                }}
                title="Prontuário atualizado"
                message="As alterações foram salvas com sucesso."
                okText="Ver prontuário"
                variant="success"
            />

            <ConfirmDialog
                open={openSaved}
                onClose={() => setOpenSaved(false)} // Continuar editando
                onConfirm={() => {
                    setOpenSaved(false);
                    navigate(`/records/${recordId}`);
                }}
                loading={false}
                variant="info"
                title="Alterações salvas"
                message="O que você deseja fazer a seguir?"
                confirmText="Ver prontuário"
                cancelText="Continuar editando"
            />
        </BaseFormLayout>
    );
}

/* ---------------------------- Layout base comum --------------------------- */
function BaseFormLayout({ children, err, footer, idHint, loading, progress, submitErr, title, }) {
    return (
        <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-10 pb-24 pt-3">
            {/* HEADER compacto (sem stepper) */}
            <div className="sticky top-[64px] z-30">
                <div className="bg-white border border-gray-200 shadow-sm sm:rounded-b-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6 md:px-8">
                        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="truncate text-base sm:text-lg font-semibold text-gray-900">
                                        {title}
                                    </h1>
                                </div>
                                {idHint && (
                                    <span className="block truncate text-[11px] text-gray-500">
                                        ID • {idHint}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                <Progress value={progress} small/>
                                <span className="text-[11px] text-gray-600">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-3"/>

            {/* Aviso de erro no envio */}
            {submitErr && (
                <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitErr}
                </div>
            )}

            {/* Loading / erro de fetch (modo edit) */}
            {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8">
                    <Skeleton/>
                </div>
            ) : err ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {err}
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="p-5 sm:p-7 md:p-8">{children}</div>
                </div>
            )}

            <div className="mt-5">{footer}</div>
        </div>
    );
}

/* ------------------------------- Footer ----------------------------------- */
function FooterSingle({ submitting, onFinish, onSave, isEdit = false, onCancel }) {
    return (
        <div className="flex w-full items-center justify-end gap-3">
            <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={onCancel}
            >
                <ArrowLeft className="h-4 w-4"/>
                Voltar
            </button>

            {isEdit && (
                <button
                    type="button"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                    onClick={onSave}
                >
                    {submitting ? (
                        <span className="h-4 w-4 animate-pulse rounded-full bg-emerald-600"/>
                    ) : (
                        <Check className="h-4 w-4"/>
                    )}
                    Salvar
                </button>
            )}

            <button
                type="button"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
                onClick={onFinish}
            >
                {submitting ? (
                    <span className="h-4 w-4 animate-pulse rounded-full bg-white/80"/>
                ) : (
                    <Check className="h-4 w-4"/>
                )}
                Finalizar
            </button>
        </div>
    );
}

/* ---------------------------- UI utilitários ------------------------------ */
function Progress({ value = 0, small = false }) {
    return (
        <div className={`relative ${small ? "h-2 w-24" : "h-3 w-36"} rounded-full bg-gray-200`}>
            <div
                className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
    );
}

function Skeleton() {
    return (
        <div className="space-y-3">
            <div className="h-4 w-1/3 rounded bg-gray-200"/>
            <div className="h-4 w-1/2 rounded bg-gray-200"/>
            <div className="h-4 w-full rounded bg-gray-200"/>
            <div className="h-4 w-2/3 rounded bg-gray-200"/>
        </div>
    );
}

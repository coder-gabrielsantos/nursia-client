import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, createRecord } from "../services/api.js";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles,
    Upload,
    X,
    Check,
} from "lucide-react";
import RecordFormFields from "../components/RecordFormFields.jsx";

import {
    deepMergePreferA,
    schemaToForm,
    formToServer,
    sanitizeForCreate,
} from "../lib/recordForm.shared.js"; // caminho relativo a partir de /src/pages

export default function ScanDoc() {
    const navigate = useNavigate();
    const role = sessionStorage.getItem("nursia_role");

    // camera
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // ui
    const [mode, setMode] = useState(null); // 'camera' | 'upload' | null
    const [streamError, setStreamError] = useState("");
    const [images, setImages] = useState([]); // até 2: [{dataUrl, previewUrl}]
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // result
    const [fullForm, setFullForm] = useState(null);

    // salvar direto
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState("");

    // Apenas admin
    useEffect(() => {
        if (role !== "admin") {
            alert("Acesso restrito a administradores.");
            navigate(-1);
        }
    }, [role, navigate]);

    // Abrir/fechar câmera conforme modo
    useEffect(() => {
        let active = true;
        async function openCamera() {
            try {
                setStreamError("");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                if (!active) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (e) {
                console.error(e);
                setStreamError("Não foi possível acessar a câmera. Use o upload abaixo.");
            }
        }
        if (mode === "camera") openCamera();
        return () => {
            active = false;
            try {
                streamRef.current?.getTracks()?.forEach((t) => t.stop());
                streamRef.current = null;
            } catch {}
        };
    }, [mode]);

    const clearAll = () => {
        setErr("");
        setImages([]);
        setFullForm(null);
        setSaveErr("");
    };

    const capture = () => {
        setErr("");
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c) return;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", 0.92);
        setImages((prev) => {
            const next = [...prev, { dataUrl, previewUrl: dataUrl }];
            return next.slice(0, 2);
        });
    };

    function pushFiles(fileList) {
        setErr("");
        const files = Array.from(fileList || [])
            .filter((f) => f.type.startsWith("image/"))
            .slice(0, 2);

        if (!files.length) {
            setErr("Selecione imagens válidas (PNG/JPG).");
            return;
        }

        const readers = files.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () =>
                    resolve({
                        dataUrl: String(reader.result || ""),
                        previewUrl: URL.createObjectURL(file),
                    });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers)
            .then((arr) => setImages(arr.slice(0, 2)))
            .catch(() => setErr("Falha ao ler as imagens."));
    }

    const extractAndMerge = async () => {
        try {
            setErr("");
            setFullForm(null);

            if (images.length === 0) {
                setErr("Adicione 2 imagens (ou ao menos 1).");
                return;
            }
            setLoading(true);

            // Extração via IA para cada imagem
            const calls = images.map((img) => api.post("/ai/extract", { image: img.dataUrl }));
            const responses = await Promise.all(calls);
            const objs = responses.map((r) => r?.data?.data || {});

            // Merge preferindo a primeira (reuso do shared)
            const base = objs[0] || {};
            const other = objs[1] || {};
            const merged = deepMergePreferA(base, other);

            // Normaliza para shape do RecordForm (reuso do shared)
            const normalized = schemaToForm(merged);
            setFullForm(normalized);
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.error || e?.message || "Falha ao extrair dados.";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    };

    // Ir para RecordForm com autofill
    const applyToForm = () => {
        if (!fullForm) return;
        sessionStorage.setItem("nursia_autofill", JSON.stringify(fullForm));
        navigate("/records/new", { replace: true, state: { autofill: fullForm } });
    };

    // Salvar direto como novo prontuário (com sanitização)
    const saveAsNewRecord = async () => {
        if (!fullForm) return;

        // validações mínimas
        if (!fullForm.nome || !fullForm.dataAtendimento) {
            setSaveErr("Preencha ao menos Nome e Data do atendimento antes de salvar.");
            return;
        }

        setSaveErr("");
        setSaving(true);
        try {
            // Reuso do contrato e sanitização (shared)
            const payload = formToServer(fullForm);
            const safe = sanitizeForCreate(payload);

            await createRecord(safe);
            navigate("/dashboard");
        } catch (e) {
            console.error("Falha ao criar registro:", e?.response?.data || e);
            const msg = e?.response?.data?.error || e?.message || "Falha ao salvar o prontuário";
            setSaveErr(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 pb-14">
            {/* ====== HERO / TÍTULO ====== */}
            {!mode && (
                <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shadow-lg">
                    <div className="relative rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 py-10 md:px-10 md:py-14">
                        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/70 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                    <Sparkles className="h-4 w-4" />
                                    IA de extração para prontuário
                                </div>
                                <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-gray-900 dark:text-white">
                                    Digitalize documentos
                                </h1>
                                <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-300">
                                    Envie até duas imagens (frente e verso, por exemplo). Se houver
                                    duas, os dados serão combinados em um único resultado pronto para
                                    preencher um novo prontuário.
                                </p>
                            </div>

                            <div className="w-full md:w-80">
                                <div className="rounded-2xl border border-gray-200 bg-white dark:bg-neutral-900 p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Dicas para melhor OCR
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                                Boa iluminação, enquadramento reto e imagem nítida.
                                            </p>
                                        </div>
                                    </div>
                                    <ul className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                                        <li>• Evite sombras e reflexos.</li>
                                        <li>• Preencha o quadro com o documento.</li>
                                        <li>• Prefira fundo uniforme.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <ChoiceCard
                                icon={<Camera className="h-6 w-6" />}
                                title="Tirar foto"
                                desc="Use a câmera do dispositivo (até 2 fotos)."
                                onClick={() => {
                                    clearAll();
                                    setMode("camera");
                                }}
                                accent="from-indigo-600 to-blue-600"
                            />
                            <ChoiceCard
                                icon={<Upload className="h-6 w-6" />}
                                title="Fazer upload"
                                desc="Envie até 2 imagens (PNG, JPG, JPEG)."
                                onClick={() => {
                                    clearAll();
                                    setMode("upload");
                                }}
                                accent="from-emerald-600 to-teal-600"
                            />
                        </div>
                    </div>
                </header>
            )}

            {/* Câmera */}
            {mode === "camera" && (
                <div className="mt-6 grid gap-4">
                    <Section title="Câmera">
                        <div className="space-y-3">
                            <video
                                ref={videoRef}
                                className="w-full aspect-video rounded-xl border border-gray-300 bg-black/40"
                                playsInline
                            />
                            {streamError && (
                                <div className="text-sm text-red-500">
                                    {streamError}{" "}
                                    <button
                                        type="button"
                                        className="underline"
                                        onClick={() => setMode("upload")}
                                    >
                                        Ir para Upload
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    intent="primary"
                                    onClick={capture}
                                    icon={<Camera className="h-4 w-4" />}
                                >
                                    Tirar foto ({images.length}/2)
                                </Button>
                                <Button
                                    intent="ghost"
                                    onClick={clearAll}
                                    icon={<RefreshCw className="h-4 w-4" />}
                                >
                                    Limpar
                                </Button>
                                <Button
                                    intent="secondary"
                                    onClick={() => {
                                        clearAll();
                                        setMode(null);
                                    }}
                                    icon={<ArrowLeft className="h-4 w-4" />}
                                >
                                    Voltar
                                </Button>
                            </div>
                        </div>
                    </Section>
                </div>
            )}

            {/* Upload */}
            {mode === "upload" && (
                <div className="mt-6 grid gap-4">
                    <Section title="Upload (até 2 imagens)">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                pushFiles(e.dataTransfer.files);
                            }}
                            className="rounded-xl border-2 border-dashed p-6 text-center bg-gray-50"
                        >
                            <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 grid place-items-center">
                                <ImageIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="mt-3 text-sm text-gray-700">
                                Arraste e solte <strong>até 2</strong> imagens aqui ou
                            </p>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white cursor-pointer hover:opacity-95">
                                    <Upload className="h-4 w-4" />
                                    <span>Selecionar arquivos</span>
                                    <input
                                        multiple
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => pushFiles(e.target.files)}
                                    />
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">PNG / JPG / JPEG</p>
                        </div>

                        <div className="mt-3">
                            <Button
                                intent="secondary"
                                onClick={() => {
                                    clearAll();
                                    setMode(null);
                                }}
                                icon={<ArrowLeft className="h-4 w-4" />}
                            >
                                Voltar
                            </Button>
                        </div>
                    </Section>
                </div>
            )}

            {/* Imagens selecionadas */}
            {images.length > 0 && (
                <Section className="mt-6" title="Imagens selecionadas">
                    <div className="flex flex-wrap gap-3">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className="relative rounded-xl border-2 border-gray-300 overflow-hidden bg-white shadow-sm"
                            >
                                <img
                                    src={img.previewUrl}
                                    alt={`Imagem ${idx + 1}`}
                                    className="h-28 w-44 object-cover"
                                />
                                <div className="absolute bottom-1 left-1 text-xs font-medium bg-white/95 rounded px-1.5 py-0.5 border">
                                    {`Imagem ${idx + 1}`}
                                </div>
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-white/95 rounded-full p-1 border hover:bg-gray-50"
                                    onClick={() => {
                                        setImages((prev) => prev.filter((_, i) => i !== idx));
                                        setFullForm(null);
                                    }}
                                    title="Remover"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                            intent="success"
                            onClick={extractAndMerge}
                            disabled={loading || images.length === 0}
                            icon={
                                loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )
                            }
                        >
                            {loading ? "Extraindo..." : "Extrair dados"}
                        </Button>
                        <Button
                            intent="ghost"
                            onClick={clearAll}
                            icon={<RefreshCw className="h-4 w-4" />}
                        >
                            Limpar tudo
                        </Button>
                    </div>

                    {err && <div className="text-sm text-red-600 mt-2">Erro: {err}</div>}
                </Section>
            )}

            {/* Próximo passo */}
            {fullForm && (
                <Section className="mt-6" title="Próximo passo">
                    <p className="text-sm text-gray-600">
                        Dados extraídos prontos para enviar ao formulário de criação.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <Button
                            intent="primary"
                            onClick={applyToForm}
                            icon={<ArrowRight className="h-4 w-4" />}
                        >
                            Ir para criar novo prontuário
                        </Button>
                    </div>
                </Section>
            )}

            {/* Form completo reutilizado (edição pré-salvar) */}
            {fullForm && (
                <div className="mt-6 rounded-2xl border border-gray-300 bg-white shadow-sm">
                    <div className="p-5 sm:p-7 md:p-8">
                        <RecordFormFields
                            value={fullForm}
                            onChange={(patch) => setFullForm((s) => ({ ...(s || {}), ...patch }))}
                            showSectionTitles={true}
                        />

                        {saveErr && (
                            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {saveErr}
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3 justify-end">
                            <Button
                                intent="ghost"
                                onClick={clearAll}
                                icon={<RefreshCw className="h-4 w-4" />}
                            >
                                Limpar tudo
                            </Button>
                            <Button
                                intent="success"
                                onClick={saveAsNewRecord}
                                disabled={saving}
                                icon={
                                    saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )
                                }
                            >
                                {saving ? "Salvando..." : "Salvar como novo prontuário"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Canvas escondido para captura de frame da câmera */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

/* ------------------------------ UI helpers locais (inalterados) ------------------------------ */

function Section({ title, children, className = "" }) {
    return (
        <section className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
            {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
            <div className={title ? "mt-3" : ""}>{children}</div>
        </section>
    );
}

function Button({ intent = "primary", icon, children, ...props }) {
    const styles = {
        primary:
            "inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-white hover:opacity-95",
        secondary:
            "inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-white hover:opacity-95",
        success:
            "inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:opacity-95",
        ghost:
            "inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 hover:bg-gray-50",
    }[intent];
    return (
        <button type="button" className={styles} {...props}>
            {icon}
            {children}
        </button>
    );
}

function ChoiceCard({ icon, title, desc, onClick, accent = "from-indigo-600 to-blue-600" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 p-[1px] text-left shadow-sm transition"
        >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${accent} opacity-20`} />
            <div className="relative rounded-2xl bg-white p-5 transition group-hover:bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100">{icon}</div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                </div>
            </div>
        </button>
    );
}

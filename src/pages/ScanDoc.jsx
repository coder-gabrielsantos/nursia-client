import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    ImageIcon,
    Loader2,
    RefreshCw,
    Sparkles,
    Upload,
    X
} from "lucide-react";

/** ========================
 * Helpers (mapeamento)
 * ======================== */

// Converte "DD/MM/AAAA" -> "AAAA-MM-DD"
function brToISO(br) {
    if (!br) return "";
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
    if (!m) return "";
    const [, d, mo, y] = m;
    return `${y}-${mo}-${d}`;
}

// Decide se um valor é “vazio” para fins de mescla
function isEmpty(v) {
    return (
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0)
    );
}

// Deep merge preferindo A; quando A estiver vazio, usa B.
function deepMergePreferA(a, b) {
    if (a === undefined) return b;
    if (b === undefined) return a;

    const isObjA = a && typeof a === "object" && !Array.isArray(a);
    const isObjB = b && typeof b === "object" && !Array.isArray(b);

    if (Array.isArray(a) || Array.isArray(b)) {
        const arrA = Array.isArray(a) ? a : isEmpty(a) ? [] : [a];
        const arrB = Array.isArray(b) ? b : isEmpty(b) ? [] : [b];
        const joined = [...arrA, ...arrB];
        const seen = new Set();
        const uniq = [];
        for (const it of joined) {
            const k = typeof it === "object" ? JSON.stringify(it) : String(it);
            if (!seen.has(k)) {
                seen.add(k);
                uniq.push(it);
            }
        }
        return uniq;
    }

    if (isObjA && isObjB) {
        const out = { ...a };
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
            out[k] = deepMergePreferA(a[k], b[k]);
            if (isEmpty(a[k]) && !isEmpty(b[k])) out[k] = b[k];
        }
        return out;
    }

    if (isEmpty(a) && !isEmpty(b)) return b;
    return a;
}

// Converte objeto OCR -> shape do RecordForm
function schemaToForm(rec = {}) {
    const mapInf = (s) => {
        const m = {
            "Paciente": "paciente",
            "Membro da Família": "membro_familia",
            "Amigo": "amigo",
            "Outros": "outros",
        };
        return m[s] || "";
    };
    const pick = (o, k, d = "") => (o && o[k] != null ? o[k] : d);
    const yn = (b) => (b ? "sim" : "nao");

    return {
        // Passo 1
        nome: rec.nome || "",
        dataAtendimento: brToISO(rec.dataAtendimento),
        naturalidade: rec.naturalidade || "",
        religiao: pick(rec.religiao, "nome", ""),
        sexo: rec.sexo || "",
        idade: rec.idade ?? "",
        filhos: rec.filhosQuantos ?? "",
        raca: rec.raca || "",
        estadoCivil: rec.estadoCivil || "",
        escolaridade: rec.escolaridade || "",
        profissao: rec.profissao || "",
        ocupacao: rec.ocupacao || "",
        diagnosticoMedicoAtual: rec.diagnosticoMedicoAtual || "",
        informante: mapInf(pick(rec.informante, "tipo", "")),
        hda: rec.hda || "",
        hp: rec.hp || "",
        medicamentosUsuais: rec.medicamentosUsuais || "",
        internacaoAnterior: rec.internacaoAnterior?.teve ? "sim" : "nao",
        internacaoOndeQuando: pick(rec.internacaoAnterior, "ondeQuando", ""),
        internacaoMotivos: pick(rec.internacaoAnterior, "motivos", ""),
        hf_DM: !!rec.historiaFamiliar?.dm,
        hf_HAS: !!rec.historiaFamiliar?.has,
        hf_Cardiopatias: !!rec.historiaFamiliar?.cardiopatias,
        hf_Enxaqueca: !!rec.historiaFamiliar?.enxaqueca,
        hf_TBC: !!rec.historiaFamiliar?.tbc,
        hf_CA: !!rec.historiaFamiliar?.ca,

        // Passo 2
        etilismoFrequencia:
            (
                {
                    "Social": "social",
                    "Todos os dias": "todos_os_dias",
                    "Três vezes por semana": "3x_semana",
                    "Mais que três vezes por semana": ">3x_semana",
                }
            )[rec.etilismo?.frequencia] || "",
        etilismoTipo: pick(rec.etilismo, "tipo", ""),
        etilismoQuantidade: pick(rec.etilismo, "quantidade", ""),
        tabagista: rec.tabagismo ? (rec.tabagismo.tabagista ? "sim" : "nao") : "",
        cigarrosDia: rec.tabagismo?.cigarrosPorDia ?? "",
        exTabagistaTempo: pick(rec.tabagismo, "exTabagistaHaQuantoTempo", ""),

        // Passo 3
        higieneCorporal: pick(rec.cuidadoCorporal, "higieneCorporalFrequenciaDia", ""),
        higieneBucal: pick(rec.cuidadoCorporal, "higieneBucalFrequenciaDia", ""),
        protese: yn(!!rec.cuidadoCorporal?.usoProtese),
        sonoRepousoConforto:
            (
                {
                    "Satisfeito": "satisfeito",
                    "Insatisfeito": "insatisfeito",
                }
            )[pick(rec.sonoRepousoConforto, "satisfacao", "")] || "",
        alimentacaoTipo: rec.nutricaoHidratacao?.alimentacao?.ricaEmGordura
            ? "gordura"
            : rec.nutricaoHidratacao?.alimentacao?.ricaEmCarboidratos
                ? "carboidratos"
                : rec.nutricaoHidratacao?.alimentacao?.ricaEmFrutas
                    ? "frutas"
                    : "",
        alimentacaoComposicao: rec.nutricaoHidratacao?.alimentacao?.ricaEmFibras
            ? "fibras"
            : rec.nutricaoHidratacao?.alimentacao?.ricaEmProteina
                ? "proteina"
                : rec.nutricaoHidratacao?.alimentacao?.ricaEmLegumesEVerduras
                    ? "legumes_verduras"
                    : "",
        hidratacaoQuantidade: pick(rec.nutricaoHidratacao?.hidratacao, "aguaQuantidadeDia", ""),

        atividadeFisica: yn(!!rec.atividadeFisica?.pratica),
        recreacaoFreq:
            (
                {
                    "Três vezes/semana": "3x_semana",
                    "Mais de três vezes/semana": ">3x_semana",
                }
            )[pick(rec.recreacao, "frequencia", "")] || "",
        recreacaoDuracao: pick(rec.recreacao, "duracao", ""),

        // Passo 4
        moradia:
            (
                {
                    "Própria": "propria",
                    "Cedida": "cedida",
                    "Alugada": "alugada",
                }
            )[pick(rec.moradia, "tipo", "")] || "",
        energiaEletrica: yn(!!rec.moradia?.energiaEletrica),
        aguaTratada: yn(!!rec.moradia?.aguaTratada),
        coletaLixo: yn(!!rec.moradia?.coletaDeLixo),
        qtdResidem: rec.moradia?.quantosResidem ?? "",
        qtdTrabalham: rec.moradia?.quantosTrabalham ?? "",

        // Passo 5
        pesoKg: rec.pesoKg ?? "",
        alturaCm: rec.alturaCm ?? "",
        glicemiaCapilar: rec.glicemiaCapilar || "",
        paSistolica: rec.paSistolica ?? "",
        paDiastolica: rec.paDiastolica ?? "",
    };
}

/** ========================
 * Componente principal (apenas CRIAÇÃO)
 * ======================== */
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
    const [images, setImages] = useState([]); // até 2: [{dataUrl, previewUrl, label}]
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // result
    const [mergedForm, setMergedForm] = useState(null);

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
            } catch {
            }
        };
    }, [mode]);

    const clearAll = () => {
        setErr("");
        setImages([]);
        setMergedForm(null);
    };

    const capture = (label) => {
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
            const next = [...prev, { dataUrl, previewUrl: dataUrl, label }];
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

        const readers = files.map((file, i) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () =>
                    resolve({
                        dataUrl: String(reader.result || ""),
                        previewUrl: URL.createObjectURL(file),
                        label: `Imagem ${i + 1}`,
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
            setMergedForm(null);

            if (images.length === 0) {
                setErr("Adicione 2 imagens (ou ao menos 1).");
                return;
            }
            setLoading(true);
            const calls = images.map((img) =>
                api.post("/ai/extract", { image: img.dataUrl })
            );
            const responses = await Promise.all(calls);
            const objs = responses.map((r) => r?.data?.data || {});

            // Se só 1 imagem, usa como está; se 2, mescla preferindo a primeira
            const base = objs[0] || {};
            const other = objs[1] || {};
            const merged = deepMergePreferA(base, other);

            setMergedForm(schemaToForm(merged));
        } catch (e) {
            console.error(e);
            const msg =
                e?.response?.data?.error || e?.message || "Falha ao extrair dados.";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    };

    // Enviar SEMPRE para novo formulário
    const applyToForm = () => {
        if (!mergedForm) return;
        navigate("/records/new", { replace: true, state: { autofill: mergedForm } });
    };

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 pb-14">
            {/* ====== HERO / TÍTULO ====== */}
            {!mode && (
                <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shadow-lg">
                    <div className="relative rounded-3xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 py-10 md:px-10 md:py-14">
                        {/* Ornament / glow */}
                        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl"/>
                        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl"/>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/70 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                    <Sparkles className="h-4 w-4"/>
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

                            {/* Decorative card */}
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

                        {/* Atalhos com cards (sem mudar comportamento) */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <ChoiceCard
                                icon={<Camera className="h-6 w-6"/>}
                                title="Tirar foto"
                                desc="Use a câmera do dispositivo (até 2 fotos)."
                                onClick={() => {
                                    clearAll();
                                    setMode("camera");
                                }}
                                accent="from-indigo-600 to-blue-600"
                            />
                            <ChoiceCard
                                icon={<Upload className="h-6 w-6"/>}
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
                                    onClick={() => capture(`Imagem ${images.length + 1}`)}
                                    icon={<Camera className="h-4 w-4"/>}
                                >
                                    Tirar foto ({images.length}/2)
                                </Button>
                                <Button
                                    intent="ghost"
                                    onClick={clearAll}
                                    icon={<RefreshCw className="h-4 w-4"/>}
                                >
                                    Limpar
                                </Button>
                                <Button
                                    intent="secondary"
                                    onClick={() => {
                                        clearAll();
                                        setMode(null);
                                    }}
                                    icon={<ArrowLeft className="h-4 w-4"/>}
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
                                <ImageIcon className="h-6 w-6 text-gray-600"/>
                            </div>
                            <p className="mt-3 text-sm text-gray-700">
                                Arraste e solte <strong>até 2</strong> imagens aqui ou
                            </p>
                            <div className="mt-2">
                                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white cursor-pointer hover:opacity-95">
                                    <Upload className="h-4 w-4"/>
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
                                icon={<ArrowLeft className="h-4 w-4"/>}
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
                                        setMergedForm(null);
                                    }}
                                    title="Remover"
                                >
                                    <X className="h-4 w-4"/>
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
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : (
                                    <Sparkles className="h-4 w-4"/>
                                )
                            }
                        >
                            {loading ? "Extraindo..." : "Extrair dados"}
                        </Button>
                        <Button
                            intent="ghost"
                            onClick={clearAll}
                            icon={<RefreshCw className="h-4 w-4"/>}
                        >
                            Limpar tudo
                        </Button>
                    </div>

                    {err && <div className="text-sm text-red-600 mt-2">Erro: {err}</div>}
                </Section>
            )}

            {mergedForm && (
                <Section className="mt-6" title="Próximo passo">
                    <p className="text-sm text-gray-600">
                        Dados extraídos prontos para enviar ao formulário de criação.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <Button intent="primary" onClick={applyToForm} icon={<ArrowRight className="h-4 w-4"/>}>
                            Ir para criar novo prontuário
                        </Button>
                    </div>
                </Section>
            )}

            <canvas ref={canvasRef} className="hidden"/>
        </div>
    );
}

/** ====== UI helpers ====== */

function Section({ title, className = "", children }) {
    return (
        <section
            className={
                "rounded-2xl border border-gray-300 bg-white p-5 shadow-sm " + className
            }
        >
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}

function ChoiceCard({ icon, title, desc, onClick, accent = "from-indigo-600 to-blue-600" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="cursor-pointer group text-left rounded-2xl bg-gradient-to-br p-[1px] shadow-lg hover:shadow-xl transition"
        >
            <div className="rounded-2xl bg-white p-5 h-full border border-gray-200">
                <div
                    className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white h-11 w-11 shadow group-hover:scale-105 transition`}
                >
                    {icon}
                </div>
                <div className="mt-3">
                    <div className="text-base font-semibold text-gray-900">{title}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-700 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                    Selecionar
                    <span>→</span>
                </div>
            </div>
        </button>
    );
}

function Button({ intent = "primary", icon, disabled, onClick, children }) {
    const base =
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm transition focus:outline-none disabled:opacity-60";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
        ghost: "border border-gray-300 bg-white hover:bg-gray-50",
    };
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`${base} ${variants[intent]}`}
        >
            {icon}
            {children}
        </button>
    );
}

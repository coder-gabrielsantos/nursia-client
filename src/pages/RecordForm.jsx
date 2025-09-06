import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDraft, deleteDraft } from "../hooks/useRecordDraft";
import { createRecord } from "../services/api";
import SelectRS from "react-select";
import InfoDialog from "../components/InfoDialog.jsx";
import useRecordDraft from "../hooks/useRecordDraft";
import {
    CheckCircle2,
    Check,
} from "lucide-react";

export default function RecordForm({ mode = "create" }) {
    const { draftId } = useParams();
    const navigate = useNavigate();

    // Guard para evitar criação dupla em StrictMode (efeito de double-invoke em dev)
    const createdRef = useRef(false);

    useEffect(() => {
        if (createdRef.current) return; // já criamos
        if (mode === "create" && !draftId) {
            createdRef.current = true; // marca antes de criar
            const id = createDraft();
            navigate(`/records/new/${id}`, { replace: true });
        }
    }, [mode, draftId, navigate]);

    if (!draftId) return null;
    return <FormSteps draftId={draftId}/>;
}

function FormSteps({ draftId }) {
    const { draft, setDraft, updateData, progress } = useRecordDraft(draftId);
    const navigate = useNavigate();
    const step = draft?.step || 1;

    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [openSuccess, setOpenSuccess] = useState(false);

    if (!draft) {
        return (
            <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-10 py-12">
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    Rascunho não encontrado.
                </div>
            </div>
        );
    }

    function next() {
        setDraft({ step: Math.min(5, step + 1) });
    }

    function prev() {
        setDraft({ step: Math.max(1, step - 1) });
    }

    // Helper para converter "YYYY-MM-DD" -> "DD/MM/YYYY" (mantém se já estiver no formato BR)
    function toDateBR(v) {
        if (!v) return v;
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
            const [y, m, d] = v.split("-");
            return `${d}/${m}/${y}`;
        }
        return v;
    }

    async function finish() {
        setSubmitErr("");
        setSubmitting(true);
        try {
            // garante step final
            setDraft({ step: 5 });

            // monta o payload a partir do rascunho
            const data = draft?.data || {};
            const payload = {
                ...data,
                // normaliza data para o que o Dashboard espera (DD/MM/AAAA)
                // (o Dashboard faz parse por "/" e ordena por dataBR)
                dataAtendimento: toDateBR(data?.dataAtendimento),
            };

            // envia para o backend
            await createRecord(payload);

            // limpa o rascunho local
            deleteDraft(draft.id);

            // feedback simples e redireciona
            setOpenSuccess(true);
        } catch (e) {
            const msg =
                e?.response?.data?.error ||
                e?.message ||
                "Falha ao salvar o prontuário";
            setSubmitErr(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-10 pb-24 pt-3">
            {/* HEADER + STEPPER (sticky) */}
            <div className="sticky top-[64px] z-30">
                <div className="bg-white border border-gray-200 shadow-sm sm:rounded-b-2xl">
                    {/* Linha única e compacta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6 md:px-8">
                        {/* Esquerda */}
                        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="truncate text-base sm:text-lg font-semibold text-gray-900">
                                        Novo prontuário
                                    </h1>
                                </div>
                                <span className="block truncate text-[11px] text-gray-500">
                                    ID • {draft.id}
                                </span>
                            </div>
                        </div>

                        {/* Direita */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                <Progress value={progress} small/>
                                <span className="text-[11px] text-gray-600">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <span className="hidden sm:block text-[11px] text-gray-500">
                                Etapa {step} de 5
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 px-1.5 sm:px-4 md:px-8 py-1.5">
                        <Stepper current={step}/>
                    </div>
                </div>
            </div>

            {/* Espaço após sticky */}
            <div className="h-3"/>

            {/* Aviso de erro no envio */}
            {submitErr && (
                <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitErr}
                </div>
            )}

            {/* Conteúdo do passo */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="p-5 sm:p-7 md:p-8">
                    {step === 1 && (
                        <FormSection
                            title="Anamnese"
                            description="Dados iniciais para identificação e histórico clínico atual."
                        >
                            <Step1_Anamnese data={draft.data} onChange={updateData}/>
                        </FormSection>
                    )}
                    {step === 2 && (
                        <FormSection
                            title="Necessidades Psicossociais"
                            description="Hábitos e fatores sociais relevantes ao cuidado."
                        >
                            <Step2_PsicoSociais data={draft.data} onChange={updateData}/>
                        </FormSection>
                    )}
                    {step === 3 && (
                        <FormSection
                            title="Necessidades Psicobiológicas"
                            description="Rotinas de cuidado, sono, nutrição e atividades."
                        >
                            <Step3_PsicoBiologicas data={draft.data} onChange={updateData}/>
                        </FormSection>
                    )}
                    {step === 4 && (
                        <FormSection
                            title="Condições de Moradia"
                            description="Infraestrutura, saneamento e composição familiar."
                        >
                            <Step4_Moradia data={draft.data} onChange={updateData}/>
                        </FormSection>
                    )}
                    {step === 5 && (
                        <FormSection
                            title="Medidas e Sinais"
                            description="Registre medidas vitais e observações finais."
                        >
                            <Step5_Medidas data={draft.data} onChange={updateData}/>
                        </FormSection>
                    )}
                </div>
            </div>

            {/* Footer nav */}
            <div className="mt-5 flex w-full items-center justify-end gap-3">
                <button
                    onClick={prev}
                    disabled={step === 1 || submitting}
                    className="cursor-pointer inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 sm:flex-none sm:w-40"
                >
                    Voltar
                </button>

                {step < 5 ? (
                    <button
                        onClick={next}
                        disabled={submitting}
                        className="cursor-pointer inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:w-40"
                    >
                        Próximo
                    </button>
                ) : (
                    <button
                        onClick={finish}
                        disabled={submitting}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 sm:flex-none sm:w-40"
                    >
                        {submitting ? "Enviando..." : (<><CheckCircle2 size={16}/> Finalizar</>)}
                    </button>
                )}
            </div>
            <InfoDialog
                open={openSuccess}
                onClose={() => {
                    setOpenSuccess(false);
                    navigate("/dashboard");
                }}
                title="Prontuário criado"
                message="O prontuário foi criado com sucesso."
                okText="Ir para o painel"
                variant="success"
            />
        </div>
    );
}

/* ---------- UI auxiliares ---------- */

function FormSection({ title, description, children }) {
    return (
        <section className="space-y-6">
            <header className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </header>
            <div className="mt-4 space-y-6">{children}</div>
        </section>
    );
}

function Progress({ value, small = false }) {
    const height = small ? "h-1.5" : "h-3";
    return (
        <div
            className={`relative ${height} w-full sm:w-40 md:w-56 overflow-hidden rounded-full bg-gray-100`}
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do formulário"
        >
            <div
                className="h-full bg-blue-600 transition-[width] duration-300 ease-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

/** Stepper com scroll controlado para telas pequenas */
function Stepper({ current }) {
    const steps = ["Anamnese", "Psicossociais", "Psicobiológicas", "Moradia", "Medidas"];
    const scrollerRef = useRef(null);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const isSmall = window.matchMedia("(max-width: 639px)").matches;
        const active = el.querySelector('[data-active="true"]');
        if (isSmall) {
            el.scrollLeft = 0;
        } else if (active) {
            active.scrollIntoView({ inline: "center", block: "nearest" });
        }
    }, [current]);

    return (
        <div
            ref={scrollerRef}
            className="overflow-x-auto no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            <ol
                className="flex w-full items-center justify-center px-2 py-2 gap-4"
                aria-label="Progresso das etapas"
            >
                {steps.map((label, i) => {
                    const n = i + 1;
                    const active = n === current;
                    const done = n < current;

                    const baseCircle =
                        "flex h-8 w-8 items-center justify-center rounded-full border text-[13px] shrink-0";

                    return (
                        <li key={label} className="flex items-center justify-center gap-2">
                            {/* Círculo */}
                            <div
                                data-active={active ? "true" : "false"}
                                className={[
                                    baseCircle,
                                    done
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                        : active
                                            ? "border-blue-400 bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-white text-gray-700",
                                ].join(" ")}
                                aria-current={active ? "step" : undefined}
                            >
                                {done ? <Check size={14}/> : n}
                            </div>

                            {/* Label */}
                            <span
                                className={[
                                    "whitespace-nowrap text-sm font-medium",
                                    done
                                        ? "text-emerald-700"
                                        : active
                                            ? "text-blue-700"
                                            : "text-gray-700",
                                ].join(" ")}
                            >
                                {label}
                            </span>

                            {/* Linha */}
                            {n < steps.length && (
                                <div
                                    className={[
                                        "h-[2px] w-10 sm:w-16",
                                        done ? "bg-emerald-300" : "bg-gray-200",
                                    ].join(" ")}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

/* ---------- CAMPOS BASE ---------- */

function FieldLabel({ children }) {
    return (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
            {children}
        </span>
    );
}

function Text({ label, value, onChange, ...props }) {
    return (
        <label className="block">
            <FieldLabel>{label}</FieldLabel>
            <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                {...props}
            />
        </label>
    );
}

function Area({ label, value, onChange, rows = 4 }) {
    return (
        <label className="block">
            <FieldLabel>{label}</FieldLabel>
            <textarea
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                rows={rows}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );
}

/** React-Select wrapper */
const rsStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
        "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB" },
    }),
    menu: (base) => ({
        ...base,
        zIndex: 40,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 4,
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
        borderRadius: 12,
    }),
    option: (base, state) => ({
        ...base,
        fontSize: 14,
        backgroundColor: state.isSelected
            ? "rgba(59,130,246,0.12)"
            : state.isFocused
                ? "rgba(59,130,246,0.08)"
                : "white",
        color: "#111827",
        cursor: "pointer",
    }),
};

function RSelect({ label, value, onChange, options, placeholder = "Selecione" }) {
    const selected = options.find((o) => o.value === value) || null;
    return (
        <label className="block">
            <FieldLabel>{label}</FieldLabel>
            <SelectRS
                value={selected}
                onChange={(opt) => onChange(opt ? opt.value : "")}
                options={options}
                placeholder={placeholder}
                isClearable
                isSearchable={false}
                styles={rsStyles}
            />
        </label>
    );
}

const opt = (value, label) => ({ value, label });

/* ---------- PASSO 1: ANAMNESE ---------- */
function Step1_Anamnese({ data = {}, onChange }) {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
                <Text label="Nome" value={data.nome} onChange={(v) => onChange({ nome: v })}/>
                <Text
                    label="Data do atendimento"
                    type="date"
                    placeholder="dia/mes/ano"
                    value={data.dataAtendimento}
                    onChange={(v) => onChange({ dataAtendimento: v })}
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <Text label="Naturalidade" value={data.naturalidade} onChange={(v) => onChange({ naturalidade: v })}/>
                <Text label="Religião" value={data.religiao} onChange={(v) => onChange({ religiao: v })}/>
                <RSelect
                    label="Sexo"
                    value={data.sexo}
                    onChange={(v) => onChange({ sexo: v })}
                    options={[opt("M", "Masculino"), opt("F", "Feminino")]}
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-4">
                <Text label="Idade" type="number" value={data.idade} onChange={(v) => onChange({ idade: v })}/>
                <Text label="Filhos (quantos)" type="number" value={data.filhos} onChange={(v) => onChange({ filhos: v })}/>
                <Text label="Raça" value={data.raca} onChange={(v) => onChange({ raca: v })}/>
                <Text label="Estado civil" value={data.estadoCivil} onChange={(v) => onChange({ estadoCivil: v })}/>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Text label="Escolaridade" value={data.escolaridade} onChange={(v) => onChange({ escolaridade: v })}/>
                <Text label="Profissão" value={data.profissao} onChange={(v) => onChange({ profissao: v })}/>
            </div>

            <Text label="Ocupação" value={data.ocupacao} onChange={(v) => onChange({ ocupacao: v })}/>

            <Text
                label="Diagnóstico médico atual"
                value={data.diagnosticoMedicoAtual}
                onChange={(v) => onChange({ diagnosticoMedicoAtual: v })}
            />

            <RSelect
                label="Informante"
                value={data.informante}
                onChange={(v) => onChange({ informante: v })}
                options={[
                    opt("paciente", "Paciente"),
                    opt("membro_familia", "Membro da família"),
                    opt("amigo", "Amigo"),
                    opt("outros", "Outros"),
                ]}
            />

            <Area label="Histórico da doença atual (HDA)" value={data.hda} onChange={(v) => onChange({ hda: v })}/>
            <Area label="História Progresso (HP)" value={data.hp} onChange={(v) => onChange({ hp: v })}/>
            <Area
                label="Medicamentos usuais"
                rows={3}
                value={data.medicamentosUsuais}
                onChange={(v) => onChange({ medicamentosUsuais: v })}
            />

            <div className="grid gap-6 sm:grid-cols-3">
                <RSelect
                    label="Internação anterior"
                    value={data.internacaoAnterior}
                    onChange={(v) => onChange({ internacaoAnterior: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não")]}
                />
                <Text
                    label="Onde/Quando"
                    value={data.internacaoOndeQuando}
                    onChange={(v) => onChange({ internacaoOndeQuando: v })}
                />
                <Text label="Motivo(s)" value={data.internacaoMotivos} onChange={(v) => onChange({ internacaoMotivos: v })}/>
            </div>

            <div>
                <FieldLabel>História familiar</FieldLabel>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {["DM", "HAS", "Cardiopatias", "Enxaqueca", "TBC", "CA"].map((k) => (
                        <label key={k} className="flex items-center gap-2 text-sm text-gray-800">
                            <input
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                                type="checkbox"
                                checked={!!data[`hf_${k}`]}
                                onChange={(e) => onChange({ [`hf_${k}`]: e.target.checked })}
                            />
                            {k}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------- PASSO 2: NECESSIDADES PSICOSSOCIAIS ---------- */
function Step2_PsicoSociais({ data = {}, onChange }) {
    return (
        <div className="space-y-8">
            <div>
                <FieldLabel>Etilismo</FieldLabel>
                <div className="grid gap-6 sm:grid-cols-3">
                    <RSelect
                        label="Frequência"
                        value={data.etilismoFrequencia}
                        onChange={(v) => onChange({ etilismoFrequencia: v })}
                        options={[
                            opt("social", "Social"),
                            opt("todos_os_dias", "Todos os dias"),
                            opt("3x_semana", "Três vezes por semana"),
                            opt(">3x_semana", "Mais que três vezes por semana"),
                        ]}
                    />
                    <Text label="Tipo" value={data.etilismoTipo} onChange={(v) => onChange({ etilismoTipo: v })}/>
                    <Text label="Quantidade" value={data.etilismoQuantidade} onChange={(v) => onChange({ etilismoQuantidade: v })}/>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <RSelect
                    label="Tabagista"
                    value={data.tabagista}
                    onChange={(v) => onChange({ tabagista: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não"), opt("ex", "Ex-tabagista")]}
                />
                <Text label="Cigarros/dia" type="number" value={data.cigarrosDia} onChange={(v) => onChange({ cigarrosDia: v })}/>
                <Text label="Ex-tabagista há quanto tempo" value={data.exTabagistaTempo} onChange={(v) => onChange({ exTabagistaTempo: v })}/>
            </div>
        </div>
    );
}

/* ---------- PASSO 3: NECESSIDADES PSICOBIOLÓGICAS ---------- */
function Step3_PsicoBiologicas({ data = {}, onChange }) {
    return (
        <div className="space-y-10">
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Cuidado corporal</h3>
                <div className="grid gap-6 sm:grid-cols-3">
                    <Text
                        label="Higiene corporal (freq./dia)"
                        value={data.higieneCorporal}
                        onChange={(v) => onChange({ higieneCorporal: v })}
                    />
                    <Text
                        label="Higiene bucal (freq./dia)"
                        value={data.higieneBucal}
                        onChange={(v) => onChange({ higieneBucal: v })}
                    />
                    <RSelect
                        label="Uso de prótese"
                        value={data.protese}
                        onChange={(v) => onChange({ protese: v })}
                        options={[opt("sim", "Sim"), opt("nao", "Não")]}
                    />
                </div>

                <div className="mt-4">
                    <RSelect
                        label="Sono, repouso e conforto"
                        value={data.sonoRepousoConforto}
                        onChange={(v) => onChange({ sonoRepousoConforto: v })}
                        options={[opt("satisfeito", "Satisfeito"), opt("insatisfeito", "Insatisfeito")]}
                    />
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Nutrição e hidratação</h3>
                <div className="grid gap-6 sm:grid-cols-3">
                    <RSelect
                        label="Alimentação principal"
                        value={data.alimentacaoTipo}
                        onChange={(v) => onChange({ alimentacaoTipo: v })}
                        options={[
                            opt("frutas", "Rica em frutas"),
                            opt("gordura", "Rica em gordura"),
                            opt("carboidratos", "Rica em carboidratos"),
                        ]}
                    />
                    <RSelect
                        label="Composição"
                        value={data.alimentacaoComposicao}
                        onChange={(v) => onChange({ alimentacaoComposicao: v })}
                        options={[
                            opt("fibras", "Rica em fibras"),
                            opt("proteina", "Rica em proteína"),
                            opt("legumes_verduras", "Rica em legumes e verduras"),
                        ]}
                    />
                    <Text
                        label="Hidratação (água/suco) - quantidade/dia"
                        value={data.hidratacaoQuantidade}
                        onChange={(v) => onChange({ hidratacaoQuantidade: v })}
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <RSelect
                    label="Atividade física"
                    value={data.atividadeFisica}
                    onChange={(v) => onChange({ atividadeFisica: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não")]}
                />
                <RSelect
                    label="Recreação (frequência)"
                    value={data.recreacaoFreq}
                    onChange={(v) => onChange({ recreacaoFreq: v })}
                    options={[opt("3x_semana", "Três vezes/semana"), opt(">3x_semana", "Mais de três vezes/semana")]}
                />
                <Text label="Duração" value={data.recreacaoDuracao} onChange={(v) => onChange({ recreacaoDuracao: v })}/>
            </div>
        </div>
    );
}

/* ---------- PASSO 4: MORADIA ---------- */
function Step4_Moradia({ data = {}, onChange }) {
    return (
        <div className="space-y-8">
            <RSelect
                label="Moradia"
                value={data.moradia}
                onChange={(v) => onChange({ moradia: v })}
                options={[opt("propria", "Própria"), opt("cedida", "Cedida"), opt("alugada", "Alugada")]}
            />

            <div className="grid gap-6 sm:grid-cols-3">
                <RSelect
                    label="Energia elétrica"
                    value={data.energiaEletrica}
                    onChange={(v) => onChange({ energiaEletrica: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não")]}
                />
                <RSelect
                    label="Água tratada"
                    value={data.aguaTratada}
                    onChange={(v) => onChange({ aguaTratada: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não")]}
                />
                <RSelect
                    label="Coleta de lixo"
                    value={data.coletaLixo}
                    onChange={(v) => onChange({ coletaLixo: v })}
                    options={[opt("sim", "Sim"), opt("nao", "Não")]}
                />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Text label="Quantos residem" type="number" value={data.qtdResidem} onChange={(v) => onChange({ qtdResidem: v })}/>
                <Text label="Quantos trabalham" type="number" value={data.qtdTrabalham} onChange={(v) => onChange({ qtdTrabalham: v })}/>
            </div>
        </div>
    );
}

/* ---------- PASSO 5: MEDIDAS/SINAIS ---------- */
function Step5_Medidas({ data = {}, onChange }) {
    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-3">
                <Text label="Peso (kg)" type="number" value={data.pesoKg} onChange={(v) => onChange({ pesoKg: v })}/>
                <Text label="Altura (cm)" type="number" value={data.alturaCm} onChange={(v) => onChange({ alturaCm: v })}/>
                <Text label="Glicemia capilar" value={data.glicemiaCapilar} onChange={(v) => onChange({ glicemiaCapilar: v })}/>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Text label="PA sistólica (mmHg)" type="number" value={data.paSistolica} onChange={(v) => onChange({ paSistolica: v })}/>
                <Text label="PA diastólica (mmHg)" type="number" value={data.paDiastolica} onChange={(v) => onChange({ paDiastolica: v })}/>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                Revise os dados antes de finalizar. O envio para o servidor será habilitado após conectarmos a rota de admin.
            </div>
        </div>
    );
}

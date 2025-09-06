import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRecord } from "../services/api";
import {
    ArrowLeft,
    FileText,
    CalendarDays,
    HeartPulse,
    Activity,
} from "lucide-react";

/* Helpers */
const dash = (v) => (v != null && v !== "" ? String(v) : "—");
const yesNo = (b) => (b === true ? "Sim" : b === false ? "Não" : "—");

export default function RecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let on = true;
        (async () => {
            try {
                setLoading(true);
                const rec = await getRecord(id);
                if (on) setData(rec);
            } catch (e) {
                setErr("Não foi possível carregar este prontuário.");
            } finally {
                if (on) setLoading(false);
            }
        })();
        return () => {
            on = false;
        };
    }, [id]);

    const title = useMemo(() => data?.nome || "Prontuário", [data?.nome]);

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-10 py-10">
            <div className="mb-6 flex items-center no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                    <ArrowLeft size={16}/> Voltar
                </button>
            </div>

            {/* Paper */}
            <div
                className="print-area relative mx-auto rounded-[28px] border border-gray-200 bg-white shadow-xl print:shadow-none"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(180deg, rgba(17,24,39,0.03) 0px, rgba(17,24,39,0.03) 1px, transparent 1px, transparent 28px)",
                }}
            >
                {/* Header */}
                <div className="rounded-t-[28px] border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 sm:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2">
                                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                                ID:{" "}
                                <span className="font-medium text-gray-800">
                                    {dash(data?._id)}
                                </span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                icon={<CalendarDays size={14}/>}
                                text={dash(data?.dataAtendimento)}
                            />
                            <Badge icon={<FileText size={14}/>} text="Prontuário"/>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8 space-y-8">
                    {loading ? (
                        <Skeleton/>
                    ) : err ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                            {err}
                        </div>
                    ) : !data ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                            Prontuário não encontrado.
                        </div>
                    ) : (
                        <>
                            {/* ANAMNESE */}
                            <Section title="Anamnese">
                                <Grid cols={2}>
                                    <Row label="Nome" value={dash(data?.nome)}/>
                                    <Row
                                        label="Data do atendimento"
                                        value={dash(data?.dataAtendimento)}
                                    />
                                </Grid>
                                <Grid cols={3}>
                                    <Row label="Naturalidade" value={dash(data?.naturalidade)}/>
                                    <Row label="Religião" value={dash(data?.religiao?.nome)}/>
                                    <Row label="Sexo" value={dash(data?.sexo)}/>
                                </Grid>
                                <Grid cols={4}>
                                    <Row label="Idade" value={dash(data?.idade)}/>
                                    <Row label="Filhos (quantos)" value={dash(data?.filhosQuantos)}/>
                                    <Row label="Raça" value={dash(data?.raca)}/>
                                    <Row label="Estado civil" value={dash(data?.estadoCivil)}/>
                                </Grid>
                                <Grid cols={2}>
                                    <Row label="Escolaridade" value={dash(data?.escolaridade)}/>
                                    <Row label="Profissão" value={dash(data?.profissao)}/>
                                </Grid>
                                <Row label="Ocupação" value={dash(data?.ocupacao)}/>
                                <Row
                                    label="Diagnóstico médico atual"
                                    value={dash(data?.diagnosticoMedicoAtual)}
                                />
                                <Grid cols={2}>
                                    <Row label="Informante" value={dash(data?.informante?.tipo)}/>
                                    <Row
                                        label="Observação do informante"
                                        value={dash(data?.informante?.observacao)}
                                    />
                                </Grid>
                                <Row
                                    label="Histórico da Doença Atual (HDA)"
                                    value={dash(data?.hda)}
                                    long
                                />
                                <Row label="História/Progresso (HP)" value={dash(data?.hp)} long/>
                                <Row
                                    label="Medicamentos usuais"
                                    value={dash(data?.medicamentosUsuais)}
                                />
                                <Grid cols={3}>
                                    <Row
                                        label="Internação anterior"
                                        value={yesNo(data?.internacaoAnterior?.teve)}
                                    />
                                    <Row
                                        label="Onde/Quando"
                                        value={dash(data?.internacaoAnterior?.ondeQuando)}
                                    />
                                    <Row
                                        label="Motivo(s)"
                                        value={dash(data?.internacaoAnterior?.motivos)}
                                    />
                                </Grid>
                                <Block title="História familiar (HF)">
                                    <Chips
                                        items={[
                                            ["DM", yesNo(data?.historiaFamiliar?.dm)],
                                            ["HAS", yesNo(data?.historiaFamiliar?.has)],
                                            ["Cardiopatias", yesNo(data?.historiaFamiliar?.cardiopatias)],
                                            ["Enxaqueca", yesNo(data?.historiaFamiliar?.enxaqueca)],
                                            ["TBC", yesNo(data?.historiaFamiliar?.tbc)],
                                            ["CA", yesNo(data?.historiaFamiliar?.ca)],
                                        ]}
                                    />
                                </Block>
                            </Section>

                            {/* PSICOSSOCIAIS */}
                            <Section title="Necessidades Psicossociais">
                                <Grid cols={3}>
                                    <Row
                                        label="Etilismo (frequência)"
                                        value={dash(data?.etilismo?.frequencia)}
                                    />
                                    <Row label="Etilismo (tipo)" value={dash(data?.etilismo?.tipo)}/>
                                    <Row
                                        label="Etilismo (quantidade)"
                                        value={dash(data?.etilismo?.quantidade)}
                                    />
                                </Grid>
                                <Grid cols={3}>
                                    <Row
                                        label="Tabagista"
                                        value={yesNo(data?.tabagismo?.tabagista)}
                                    />
                                    <Row
                                        label="Cigarros/dia"
                                        value={dash(data?.tabagismo?.cigarrosPorDia)}
                                    />
                                    <Row
                                        label="Ex-tabagista há quanto tempo"
                                        value={dash(data?.tabagismo?.exTabagistaHaQuantoTempo)}
                                    />
                                </Grid>
                            </Section>

                            {/* PSICOBIOLÓGICAS */}
                            <Section title="Necessidades Psicobiológicas">
                                <Block title="Cuidado corporal">
                                    <Grid cols={3}>
                                        <Row
                                            label="Higiene corporal (freq./dia)"
                                            value={dash(
                                                data?.cuidadoCorporal?.higieneCorporalFrequenciaDia
                                            )}
                                        />
                                        <Row
                                            label="Higiene bucal (freq./dia)"
                                            value={dash(
                                                data?.cuidadoCorporal?.higieneBucalFrequenciaDia
                                            )}
                                        />
                                        <Row
                                            label="Uso de prótese"
                                            value={yesNo(data?.cuidadoCorporal?.usoProtese)}
                                        />
                                    </Grid>
                                </Block>

                                <Grid cols={2}>
                                    <Row
                                        label="Sono, repouso e conforto"
                                        value={dash(data?.sonoRepousoConforto?.satisfacao)}
                                    />
                                </Grid>

                                <Block title="Nutrição e hidratação">
                                    <Grid cols={3}>
                                        <Row
                                            label="Alimentação — rica em frutas"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao?.ricaEmFrutas
                                            )}
                                        />
                                        <Row
                                            label="Rica em gordura"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao?.ricaEmGordura
                                            )}
                                        />
                                        <Row
                                            label="Rica em carboidratos"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao?.ricaEmCarboidratos
                                            )}
                                        />
                                        <Row
                                            label="Rica em fibras"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao?.ricaEmFibras
                                            )}
                                        />
                                        <Row
                                            label="Rica em proteína"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao?.ricaEmProteina
                                            )}
                                        />
                                        <Row
                                            label="Rica em legumes e verduras"
                                            value={yesNo(
                                                data?.nutricaoHidratacao?.alimentacao
                                                    ?.ricaEmLegumesEVerduras
                                            )}
                                        />
                                    </Grid>
                                    <Grid cols={2}>
                                        <Row
                                            label="Hidratação (água/suco) - quantidade/dia"
                                            value={dash(
                                                data?.nutricaoHidratacao?.hidratacao?.aguaQuantidadeDia
                                            )}
                                        />
                                        <Row
                                            label="Suco (quantidade/dia)"
                                            value={dash(
                                                data?.nutricaoHidratacao?.hidratacao?.sucoQuantidadeDia
                                            )}
                                        />
                                    </Grid>
                                </Block>

                                <Grid cols={3}>
                                    <Row
                                        label="Atividade física"
                                        value={yesNo(data?.atividadeFisica?.pratica)}
                                    />
                                    <Row
                                        label="Recreação (frequência)"
                                        value={dash(data?.recreacao?.frequencia)}
                                    />
                                    <Row label="Duração" value={dash(data?.recreacao?.duracao)}/>
                                </Grid>
                            </Section>

                            {/* MORADIA */}
                            <Section title="Condições de Moradia">
                                <Grid cols={3}>
                                    <Row label="Moradia" value={dash(data?.moradia?.tipo)}/>
                                    <Row
                                        label="Energia elétrica"
                                        value={yesNo(data?.moradia?.energiaEletrica)}
                                    />
                                    <Row
                                        label="Água tratada"
                                        value={yesNo(data?.moradia?.aguaTratada)}
                                    />
                                    <Row
                                        label="Coleta de lixo"
                                        value={yesNo(data?.moradia?.coletaDeLixo)}
                                    />
                                    <Row
                                        label="Quantos residem"
                                        value={dash(data?.moradia?.quantosResidem)}
                                    />
                                    <Row
                                        label="Quantos trabalham"
                                        value={dash(data?.moradia?.quantosTrabalham)}
                                    />
                                </Grid>
                            </Section>

                            {/* MEDIDAS / SINAIS */}
                            <Section
                                title="Medidas e Sinais"
                                icon={<HeartPulse size={16} className="text-rose-600"/>}
                            >
                                <Grid cols={3}>
                                    <Row label="Peso (kg)" value={dash(data?.pesoKg)}/>
                                    <Row label="Altura (cm)" value={dash(data?.alturaCm)}/>
                                    <Row label="Glicemia capilar" value={dash(data?.glicemiaCapilar)}/>
                                </Grid>
                                <Grid cols={2}>
                                    <Row
                                        label="PA sistólica (mmHg)"
                                        value={dash(data?.paSistolica)}
                                    />
                                    <Row
                                        label="PA diastólica (mmHg)"
                                        value={dash(data?.paDiastolica)}
                                    />
                                </Grid>
                                <div className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500">
                                    <Activity size={14}/> Última atualização:{" "}
                                    {new Date(
                                        data?.updatedAt || data?.createdAt || Date.now()
                                    ).toLocaleString()}
                                </div>
                            </Section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* UI Subcomponents */
function Badge({ icon, text }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700">
            {icon}
            {text}
        </span>
    );
}

function Section({ title, children, icon }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur-[0.5px]">
            <header className="mb-4 flex items-center gap-2">
                {icon}
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            </header>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Block({ title, children }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="mb-2 text-sm font-semibold text-gray-800">{title}</div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Grid({ cols = 2, children }) {
    const cls =
        cols === 3 ? "sm:grid-cols-3" : cols === 4 ? "sm:grid-cols-4" : "sm:grid-cols-2";
    return <div className={`grid gap-3 ${cls}`}>{children}</div>;
}

function Row({ label, value, long = false }) {
    return (
        <div
            className={`rounded-xl border border-gray-100 bg-white px-3 py-2.5 ${
                long ? "sm:col-span-2" : ""
            }`}
        >
            <div className="text-[11px] uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-0.5 text-sm text-gray-900">{value}</div>
        </div>
    );
}

function Chips({ items = [] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map(([k, v]) => (
                <span
                    key={k}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800"
                >
                <span className="font-medium">{k}:</span> {v}</span>
            ))}
        </div>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100"/>
            ))}
        </div>
    );
}

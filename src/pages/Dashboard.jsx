import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDrafts, deleteDraft } from "../hooks/useRecordDraft";
import { listRecords } from "../services/api";
import {
    Plus, RefreshCw, Search, TrendingUp, HeartPulse, Activity, Filter, ArrowUpDown, ChevronLeft, ChevronRight
} from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const [raw, setRaw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // filtros
    const [q, setQ] = useState("");
    const [sortBy, setSortBy] = useState("recent"); // recent | name

    // flag local para saber se é admin (existe admin key no sessionStorage)
    const [isAdmin, setIsAdmin] = useState(() => !!sessionStorage.getItem("nursia_admin_key"));

    // mantém flag em sincronia caso a key seja atualizada em outra aba
    useEffect(() => {
        const check = () => setIsAdmin(!!sessionStorage.getItem("nursia_admin_key"));
        window.addEventListener("storage", check);
        // também checa ao focar a aba
        window.addEventListener("focus", check);
        return () => {
            window.removeEventListener("storage", check);
            window.removeEventListener("focus", check);
        };
    }, []);

    async function fetchData() {
        try {
            setLoading(true);
            setErr("");
            const data = await listRecords({ q: q.trim() || undefined });
            setRaw(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr("Não foi possível carregar os prontuários.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // KPIs simples
    const kpis = useMemo(() => {
        const total = raw.length;
        const paElevada = raw.filter((r) => Number(r?.paSistolica) >= 140).length;
        const glicemiaAlterada = raw.filter((r) => {
            const g = Number(String(r?.glicemiaCapilar || "").replace(",", "."));
            return !Number.isNaN(g) && g >= 180;
        }).length;
        return { total, paElevada, glicemiaAlterada };
    }, [raw]);

    // lista ordenada
    const items = useMemo(() => {
        const parseBR = (s) => {
            const [dd, mm, yyyy] = (s || "").split("/");
            if (!dd || !mm || !yyyy) return 0;
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
        };
        const list = [...raw];
        list.sort((a, b) => {
            if (sortBy === "recent") return parseBR(b.dataAtendimento) - parseBR(a.dataAtendimento);
            if (sortBy === "name") return (a?.nome || "").localeCompare(b?.nome || "");
            return 0;
        });
        return list;
    }, [raw, sortBy]);

    return (
        <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12 pb-12">
            {/* Header + CTAs */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Visão geral dos prontuários e sinais importantes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                        title="Atualizar"
                    >
                        <RefreshCw size={16}/> Atualizar
                    </button>

                    {/* Só admins veem o botão de novo prontuário */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate("/records/new")}
                            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow hover:bg-blue-700"
                        >
                            <Plus size={16}/> Novo prontuário
                        </button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Kpi
                    icon={<TrendingUp size={18} className="text-blue-600"/>}
                    title="Prontuários"
                    value={kpis.total}
                    hint="Total carregado"
                />
                <Kpi
                    icon={<Activity size={18} className="text-rose-600"/>}
                    title="PA ≥ 140 mmHg"
                    value={kpis.paElevada}
                    hint="Sistólica elevada"
                />
                <Kpi
                    icon={<HeartPulse size={18} className="text-emerald-600"/>}
                    title="Glicemia ≥ 180 mg/dL"
                    value={kpis.glicemiaAlterada}
                    hint="Valores alterados"
                />
            </div>

            {/* FILTROS — alinhados */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Busca */}
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
                            Buscar por nome
                        </label>
                        <div className="relative">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                                placeholder="Ex.: Maria, João..."
                                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    {/* Select moderno */}
                    <div className="w-full md:w-64">
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
                            Ordenar
                        </label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-3 pr-10 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="recent">Mais recentes</option>
                                <option value="name">Nome (A–Z)</option>
                            </select>
                            <ArrowUpDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>

                    {/* Ações dos filtros */}
                    <div className="flex w-full gap-2 md:w-auto mt-6 md:mt-[18px]">
                        <button
                            onClick={fetchData}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 md:flex-none"
                        >
                            <Filter size={16}/> Aplicar
                        </button>
                        <button
                            onClick={() => setQ("")}
                            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 md:flex-none"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {/* Rascunhos: só admins conseguem criar/retomar formulários */}
            {isAdmin && <Rascunhos/>}

            {/* Lista */}
            {loading ? (
                <SkeletonGrid/>
            ) : err ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Nenhum prontuário encontrado.
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => (
                        <RecordCard key={r._id} record={r}/>
                    ))}
                </div>
            )}
        </div>
    );
}

/* --- Components --- */

function Kpi({ icon, title, value, hint }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600">{title}</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">{icon}</div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">{value ?? "—"}</div>
            <div className="mt-1 text-xs text-gray-500">{hint}</div>
        </div>
    );
}

function RecordCard({ record }) {
    const { nome, dataAtendimento, paSistolica, paDiastolica, pesoKg, alturaCm, glicemiaCapilar } = record || {};
    const pa = (paSistolica != null && paDiastolica != null) ? `${paSistolica}/${paDiastolica} mmHg` : "—";
    const peso = pesoKg != null ? `${pesoKg} kg` : "—";
    const altura = alturaCm != null ? `${alturaCm} cm` : "—";
    const glicemia = glicemiaCapilar || "—";

    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm text-gray-500">{dataAtendimento || "—"}</div>
                    <h3 className="mt-0.5 text-base font-semibold text-gray-900">{nome || "Paciente"}</h3>
                </div>
                <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Prontuário</span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="PA" value={pa}/>
                <InfoRow label="Glicemia" value={glicemia}/>
                <InfoRow label="Peso" value={peso}/>
                <InfoRow label="Altura" value={altura}/>
            </dl>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
            <div className="truncate text-sm text-gray-900">{value}</div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 h-4 w-1/3 rounded bg-gray-200"/>
                    <div className="mb-6 h-5 w-2/3 rounded bg-gray-200"/>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 rounded-xl bg-gray-100"/>
                        <div className="h-12 rounded-xl bg-gray-100"/>
                        <div className="h-12 rounded-xl bg-gray-100"/>
                        <div className="h-12 rounded-xl bg-gray-100"/>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Rascunhos() {
    const [drafts, setDrafts] = useState([]);
    const navigate = useNavigate();

    // paginação
    const [page, setPage] = useState(1);
    const pageSize = 4; // 2 colunas × 2 linhas
    const totalPages = Math.max(1, Math.ceil(drafts.length / pageSize));
    const start = (page - 1) * pageSize;
    const visible = drafts.slice(start, start + pageSize);

    useEffect(() => {
        const data = listDrafts();
        setDrafts(data);
        // corrige página se apagar/alterar quantidade
        const newTotal = Math.max(1, Math.ceil(data.length / pageSize));
        if (page > newTotal) setPage(newTotal);
    }, [page]);

    if (drafts.length === 0) return null;

    const go = (p) => setPage(Math.min(Math.max(1, p), totalPages));

    return (
        <section className="mb-6">
            <header className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Rascunhos</h3>
                    <p className="text-xs text-gray-500">
                        {drafts.length} {drafts.length === 1 ? "item" : "itens"} em andamento
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setDrafts(listDrafts());
                            go(1);
                        }}
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 hover:bg-gray-50"
                        title="Recarregar rascunhos"
                    >
                        Atualizar
                    </button>

                    {/* Controles de paginação */}
                    <nav className="inline-flex items-center gap-1">
                        <button
                            onClick={() => go(page - 1)}
                            disabled={page === 1}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-2 text-xs text-gray-600 tabular-nums">
                            {page}/{totalPages}
                        </span>
                        <button
                            onClick={() => go(page + 1)}
                            disabled={page === totalPages}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                            aria-label="Próxima página"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </nav>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visible.map((d, i) => {
                    const index = start + i + 1; // numerar 1,2,3...
                    const pct = Math.min(100, Math.max(0, (d.step - 1) * 20));

                    return (
                        <div
                            key={d.id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-gray-300"
                        >
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-blue-500 to-indigo-500" />

                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-semibold text-gray-900">
                                      Rascunho #{index}
                                    </span>
                                    <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                        {d.step}/5
                                    </span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-gray-500 truncate">
                                        Atualizado {new Date(d.updatedAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-700 border border-gray-100">
                                    {d.step < 5 ? "Em edição" : "Para finalizar"}
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-[11px] text-gray-600 tabular-nums">
                                    {pct}%
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => navigate(`/records/new/${d.id}`)}
                                    className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                    Continuar
                                </button>
                                <button
                                    onClick={() => {
                                        deleteDraft(d.id);
                                        const data = listDrafts();
                                        setDrafts(data);
                                        const newTotal = Math.max(1, Math.ceil(data.length / pageSize));
                                        if (page > newTotal) setPage(newTotal);
                                    }}
                                    className="h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 hover:bg-gray-50"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
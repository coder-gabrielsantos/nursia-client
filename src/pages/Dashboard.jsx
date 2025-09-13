import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listDrafts, deleteDraft } from "../hooks/useRecordDraft"
import { listRecords, setRolePassword } from '../services/api'
import {
    Activity, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Filter, HeartPulse, Plus, Search, Sparkles, TrendingUp, Key
} from "lucide-react"
import SelectRS from "react-select"

export default function Dashboard() {
    const navigate = useNavigate()
    const [raw, setRaw] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState("")

    // filtros
    const [q, setQ] = useState("")
    const [sortBy, setSortBy] = useState("recent") // recent | oldest | name

    // flag local para saber se é admin (existe admin key no sessionStorage)
    const [isAdmin, setIsAdmin] = useState(() => !!sessionStorage.getItem("nursia_admin_key"))

    // mantém flag em sincronia caso a key seja atualizada em outra aba
    useEffect(() => {
        const check = () => setIsAdmin(!!sessionStorage.getItem("nursia_admin_key"))
        window.addEventListener("storage", check)
        window.addEventListener("focus", check)
        return () => {
            window.removeEventListener("storage", check)
            window.removeEventListener("focus", check)
        }
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            setErr("")
            const data = await listRecords({ q: q.trim() || undefined })
            setRaw(Array.isArray(data) ? data : [])
        } catch (e) {
            setErr("Não foi possível carregar os prontuários.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // KPIs simples
    const kpis = useMemo(() => {
        const total = raw.length
        const paElevada = raw.filter((r) => Number(r?.paSistolica) >= 140).length
        const glicemiaAlterada = raw.filter((r) => {
            const g = Number(String(r?.glicemiaCapilar || "").replace(",", "."))
            return !Number.isNaN(g) && g >= 180
        }).length
        return { total, paElevada, glicemiaAlterada }
    }, [raw])

    // lista ordenada
    const items = useMemo(() => {
        const parseBR = (s) => {
            const [dd, mm, yyyy] = (s || "").split("/")
            if (!dd || !mm || !yyyy) return 0
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime()
        }
        const list = [...raw]
        list.sort((a, b) => {
            if (sortBy === "recent") return parseBR(b.dataAtendimento) - parseBR(a.dataAtendimento)
            if (sortBy === "oldest") return parseBR(a.dataAtendimento) - parseBR(b.dataAtendimento)
            if (sortBy === "name") return (a?.nome || "").localeCompare(b?.nome || "")
            return 0
        })
        return list
    }, [raw, sortBy])

    const [recPage, setRecPage] = useState(1)
    const recPageSize = 9
    const recTotalPages = Math.max(1, Math.ceil(items.length / recPageSize))
    const recStart = (recPage - 1) * recPageSize
    const visibleRecords = items.slice(recStart, recStart + recPageSize)

    useEffect(() => {
        const newTotal = Math.max(1, Math.ceil(items.length / recPageSize))
        if (recPage > newTotal) setRecPage(newTotal)
    }, [items, recPage])

    const goRec = (p) => setRecPage(Math.min(Math.max(1, p), recTotalPages))

    /* ---------- Logout + Alteração de senhas ---------- */
    const [showPwdModal, setShowPwdModal] = useState(false)
    const [newAdminPwd, setNewAdminPwd] = useState("")
    const [newNursePwd, setNewNursePwd] = useState("")
    const [pwdBusy, setPwdBusy] = useState(false)
    const [pwdMsg, setPwdMsg] = useState("")

    async function handleSavePasswords() {
        setPwdMsg('')
        if (!newAdminPwd && !newNursePwd) {
            setPwdMsg('Informe ao menos uma senha para alterar.')
            return
        }
        try {
            setPwdBusy(true)
            if (newAdminPwd) await setRolePassword({ target: 'admin', newPassword: newAdminPwd })
            if (newNursePwd) await setRolePassword({ target: 'nurse', newPassword: newNursePwd })

            setPwdMsg('Senha(s) atualizada(s) no banco com sucesso.')
            setNewAdminPwd('')
            setNewNursePwd('')
        } catch (e) {
            const msg = e?.response?.data?.error || 'Não foi possível alterar as senhas.'
            setPwdMsg(msg)
        } finally {
            setPwdBusy(false)
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12 pb-12">
            {/* Header + CTAs */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Visão geral dos prontuários e sinais importantes.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                    {/* Só admins veem os botões de criação */}
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => navigate('/records/new')}
                                className="cursor-pointer inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 sm:w-auto whitespace-nowrap"
                            >
                                <Plus size={16} /> Novo prontuário
                            </button>

                            <button
                                onClick={() => navigate('/records/new/scan')}
                                className="cursor-pointer inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 sm:w-auto whitespace-nowrap"
                                title="Digitalizar documento e extrair dados para um novo prontuário"
                            >
                                <Sparkles size={16} /> Novo prontuário (IA)
                            </button>

                            {/* Botão Alterar senhas (somente admin) */}
                            <button
                                onClick={() => setShowPwdModal(true)}
                                className="cursor-pointer inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 sm:w-auto whitespace-nowrap"
                                title="Alterar senhas de administrador e de enfermeiros"
                            >
                                <Key size={16} /> Alterar senhas
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Kpi
                    icon={<TrendingUp size={18} className="text-blue-600" />}
                    title="Prontuários"
                    value={kpis.total}
                    hint="Total carregado"
                />
                <Kpi
                    icon={<Activity size={18} className="text-rose-600" />}
                    title="PA ≥ 140 mmHg"
                    value={kpis.paElevada}
                    hint="Sistólica elevada"
                />
                <Kpi
                    icon={<HeartPulse size={18} className="text-emerald-600" />}
                    title="Glicemia ≥ 180 mg/dL"
                    value={kpis.glicemiaAlterada}
                    hint="Valores alterados"
                />
            </div>

            {/* FILTROS */}
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
                            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Ordenação */}
                    <div className="w-full md:w-64">
                        <RSelect
                            label="Ordenar"
                            value={sortBy}
                            onChange={(v) => setSortBy(v || "recent")}
                            options={[opt("recent", "Mais recentes"), opt("oldest", "Mais antigos"), opt("name", "Nome (A–Z)")]}
                            placeholder="Selecione"
                        />
                    </div>

                    {/* Ações dos filtros */}
                    <div className="flex w-full gap-2 md:w-auto mt-6 md:mt-[18px]">
                        <button
                            onClick={fetchData}
                            className="inline-flex cursor-pointer h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 md:flex-none"
                        >
                            <Filter size={16} /> Aplicar
                        </button>
                        <button
                            onClick={() => setQ("")}
                            className="inline-flex cursor-pointer h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 md:flex-none"
                        >
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {/* Rascunhos: só admins conseguem criar/retomar formulários */}
            {isAdmin && <Rascunhos />}

            {/* Separador */}
            <div className="my-8 border-t border-gray-200" />

            {/* Lista de Prontuários */}
            {loading ? (
                <SkeletonGrid />
            ) : err ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
            ) : items.length === 0 ? (
                <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                    Nenhum prontuário encontrado.
                </section>
            ) : (
                <section className="mb-6">
                    <header className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Prontuários</h3>
                            <p className="text-xs text-gray-500">
                                {items.length} {items.length === 1 ? "registro" : "registros"} encontrados
                            </p>
                        </div>

                        {/* Paginação */}
                        <nav className="inline-flex items-center gap-1">
                            <button
                                onClick={() => goRec(recPage - 1)}
                                disabled={recPage === 1}
                                className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="px-2 text-xs text-gray-600 tabular-nums">
                                {recPage}/{recTotalPages}
                            </span>
                            <button
                                onClick={() => goRec(recPage + 1)}
                                disabled={recPage === recTotalPages}
                                className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                                aria-label="Próxima página"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </nav>
                    </header>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleRecords.map((r) => (
                            <RecordCard key={r._id} record={r} />
                        ))}
                    </div>
                </section>
            )}

            {/* Modal: Alterar senhas */}
            {showPwdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => {
                            if (!pwdBusy) setShowPwdModal(false)
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 pb-4">
                            <Key size={18} /> Alterar senhas
                        </h3>
                        <div className="mt-4 space-y-4">
                            <label className="block">
                                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-700">
                                    Administrador
                                </span>
                                <input
                                    type="password"
                                    value={newAdminPwd}
                                    onChange={(e) => setNewAdminPwd(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="••••••••"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-700">
                                    Enfermeiros
                                </span>
                                <input
                                    type="password"
                                    value={newNursePwd}
                                    onChange={(e) => setNewNursePwd(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="••••••••"
                                />
                            </label>

                            {pwdMsg && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                    {pwdMsg}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                disabled={pwdBusy}
                                onClick={() => setShowPwdModal(false)}
                                className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={pwdBusy}
                                onClick={handleSavePasswords}
                                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {pwdBusy ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
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
    )
}

function RecordCard({ record }) {
    const navigate = useNavigate()
    const { _id, nome, dataAtendimento, idade, sexo, paSistolica, paDiastolica, glicemiaCapilar } = record || {}

    return (
        <button
            type="button"
            onClick={() => navigate(`/records/${_id}`)}
            aria-label={`Abrir prontuário de ${nome || "paciente"}`}
            className="
                cursor-pointer group w-full overflow-hidden rounded-2xl
                border border-gray-200 bg-white p-5 text-left shadow-sm
                transition-all duration-200 hover:shadow-md hover:border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-200
            "
        >
            {/* Cabeçalho: Nome + Data */}
            <div className="mb-3 flex items-center justify-between">
                <h3 className="truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-gray-800" title={nome || "Paciente"}>
                    {nome || "Paciente"}
                </h3>
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays size={14} className="shrink-0" />
                    <span className="truncate">{dataAtendimento || "—"}</span>
                </div>
            </div>

            {/* Informações */}
            <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                    <div className="mb-0.5 text-[11px] uppercase tracking-wide text-gray-500">Idade</div>
                    <div className="font-medium text-gray-900">{idade ? `${idade} anos` : "—"}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                    <div className="mb-0.5 text-[11px] uppercase tracking-wide text-gray-500">Sexo</div>
                    <div className="font-medium text-gray-900">{sexo || "—"}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 col-span-2 flex justify-between">
                    <div>
                        <div className="mb-0.5 text-[11px] uppercase tracking-wide text-gray-500">PA</div>
                        <div className="font-medium text-gray-900">
                            {paSistolica && paDiastolica ? `${paSistolica}/${paDiastolica} mmHg` : "—"}
                        </div>
                    </div>
                    <div>
                        <div className="mb-0.5 text-[11px] uppercase tracking-wide text-gray-500">Glicemia</div>
                        <div className="font-medium text-gray-900">{glicemiaCapilar ? `${glicemiaCapilar} mg/dL` : "—"}</div>
                    </div>
                </div>
            </div>

            {/* Rodapé */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Clique para abrir
                </div>
                <span className="inline-flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Ver detalhes <ArrowRight size={14} className="shrink-0" />
                </span>
            </div>
        </button>
    )
}

function SkeletonGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
                    <div className="mb-6 h-5 w-2/3 rounded bg-gray-200" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 rounded-xl bg-gray-100" />
                        <div className="h-12 rounded-xl bg-gray-100" />
                        <div className="h-12 rounded-xl bg-gray-100" />
                        <div className="h-12 rounded-xl bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ---------- RSelect (mesmo padrão do RecordForm) ---------- */
function FieldLabel({ children }) {
    return <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-700">{children}</span>
}

const rsStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
        "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB" }
    }),
    menu: (base) => ({
        ...base,
        zIndex: 40,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 4
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
        borderRadius: 12
    }),
    option: (base, state) => ({
        ...base,
        fontSize: 14,
        backgroundColor: state.isSelected ? "rgba(59,130,246,0.12)" : state.isFocused ? "rgba(59,130,246,0.08)" : "white",
        color: "#111827",
        cursor: "pointer"
    })
}

function RSelect({ label, value, onChange, options, placeholder = "Selecione" }) {
    const selected = options.find((o) => o.value === value) || null
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
    )
}

const opt = (value, label) => ({ value, label })

/* ---------- Rascunhos ---------- */
function Rascunhos() {
    const [drafts, setDrafts] = useState([])
    const navigate = useNavigate()

    // paginação
    const [page, setPage] = useState(1)
    const pageSize = 4 // 2 colunas × 2 linhas
    const totalPages = Math.max(1, Math.ceil(drafts.length / pageSize))
    const start = (page - 1) * pageSize
    const visible = drafts.slice(start, start + pageSize)

    useEffect(() => {
        const data = listDrafts()
        setDrafts(data)
        const newTotal = Math.max(1, Math.ceil(data.length / pageSize))
        if (page > newTotal) setPage(newTotal)
    }, [page])

    if (drafts.length === 0) return null

    const go = (p) => setPage(Math.min(Math.max(1, p), totalPages))

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
                    {/* Paginação */}
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
                    const index = start + i + 1 // numerar 1,2,3...
                    const pct = Math.min(100, Math.max(0, (d.step - 1) * 20))

                    return (
                        <div
                            key={d.id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-gray-300"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-semibold text-gray-900">Rascunho #{index}</span>
                                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text[10px] text-[10px] font-medium text-blue-700">
                                            {d.step}/5
                                        </span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-gray-500 truncate">Atualizado {new Date(d.updatedAt).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-700 border border-gray-100">
                                    {d.step < 5 ? "Em edição" : "Para finalizar"}
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[11px] text-gray-600 tabular-nums">{pct}%</span>
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => navigate(`/records/new/${d.id}`)}
                                    className="cursor-pointer h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                    Continuar
                                </button>
                                <button
                                    onClick={() => {
                                        deleteDraft(d.id)
                                        const data = listDrafts()
                                        setDrafts(data)
                                        const newTotal = Math.max(1, Math.ceil(data.length / pageSize))
                                        if (page > newTotal) setPage(newTotal)
                                    }}
                                    className="cursor-pointer h-8 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 hover:bg-gray-50"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

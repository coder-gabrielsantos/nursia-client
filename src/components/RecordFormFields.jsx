import React from "react";
import SelectRS from "react-select";

export default function RecordFormFields({ value = {}, onChange, showSectionTitles = true, readOnly = false, }) {
    const v = value;
    const patch = (k, val) => onChange?.({ [k]: val });

    return (
        <div className="space-y-10">
            {/* 1) Anamnese */}
            <FormSection
                title={showSectionTitles ? "Anamnese" : null}
                description={
                    showSectionTitles
                        ? "Dados iniciais para identificação e histórico clínico."
                        : null
                }
            >
                <div className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Text label="Nome" value={v.nome} onChange={(x) => patch("nome", x)} readOnly={readOnly}/>
                        <Text
                            label="Data do atendimento"
                            type="date"
                            value={v.dataAtendimento || ""}
                            onChange={(x) => patch("dataAtendimento", x)}
                            readOnly={readOnly}
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <Text label="Naturalidade" value={v.naturalidade} onChange={(x) => patch("naturalidade", x)} readOnly={readOnly}/>
                        <Text label="Religião" value={v.religiao} onChange={(x) => patch("religiao", x)} readOnly={readOnly}/>
                        <RSelect
                            label="Sexo"
                            value={v.sexo}
                            onChange={(x) => patch("sexo", x)}
                            options={[opt("M", "Masculino"), opt("F", "Feminino")]}
                            isDisabled={readOnly}
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-4">
                        <Text label="Idade" type="number" value={v.idade} onChange={(x) => patch("idade", x)} readOnly={readOnly}/>
                        <Text label="Filhos (quantos)" type="number" value={v.filhos} onChange={(x) => patch("filhos", x)} readOnly={readOnly}/>
                        <Text label="Raça" value={v.raca} onChange={(x) => patch("raca", x)} readOnly={readOnly}/>
                        <Text label="Estado civil" value={v.estadoCivil} onChange={(x) => patch("estadoCivil", x)} readOnly={readOnly}/>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Text label="Escolaridade" value={v.escolaridade} onChange={(x) => patch("escolaridade", x)} readOnly={readOnly}/>
                        <Text label="Profissão" value={v.profissao} onChange={(x) => patch("profissao", x)} readOnly={readOnly}/>
                    </div>

                    <Text label="Ocupação" value={v.ocupacao} onChange={(x) => patch("ocupacao", x)} readOnly={readOnly}/>

                    <Text
                        label="Diagnóstico médico atual"
                        value={v.diagnosticoMedicoAtual}
                        onChange={(x) => patch("diagnosticoMedicoAtual", x)}
                        readOnly={readOnly}
                    />

                    <RSelect
                        label="Informante"
                        value={v.informante}
                        onChange={(x) => patch("informante", x)}
                        options={[
                            opt("paciente", "Paciente"),
                            opt("membro_familia", "Membro da família"),
                            opt("amigo", "Amigo"),
                            opt("outros", "Outros"),
                        ]}
                        isDisabled={readOnly}
                    />

                    <Area label="Histórico da doença atual (HDA)" value={v.hda} onChange={(x) => patch("hda", x)} readOnly={readOnly}/>
                    <Area label="História Progresso (HP)" value={v.hp} onChange={(x) => patch("hp", x)} readOnly={readOnly}/>
                    <Area label="Medicamentos usuais" rows={3} value={v.medicamentosUsuais} onChange={(x) => patch("medicamentosUsuais", x)} readOnly={readOnly}/>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <RSelect
                            label="Internação anterior"
                            value={v.internacaoAnterior}
                            onChange={(x) => patch("internacaoAnterior", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não")]}
                            isDisabled={readOnly}
                        />
                        <Text label="Onde/Quando" value={v.internacaoOndeQuando} onChange={(x) => patch("internacaoOndeQuando", x)} readOnly={readOnly}/>
                        <Text label="Motivo(s)" value={v.internacaoMotivos} onChange={(x) => patch("internacaoMotivos", x)} readOnly={readOnly}/>
                    </div>

                    <div>
                        <FieldLabel>História familiar</FieldLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {["DM", "HAS", "Cardiopatias", "Enxaqueca", "TBC", "CA"].map((k) => (
                                <label key={k} className="flex items-center gap-2 text-sm text-gray-800">
                                    <input
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                                        type="checkbox"
                                        checked={!!v[`hf_${k}`]}
                                        onChange={(e) => patch(`hf_${k}`, e.target.checked)}
                                        disabled={readOnly}
                                    />
                                    {k}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* 2) Psicossociais */}
            <FormSection
                title={showSectionTitles ? "Necessidades Psicossociais" : null}
                description={showSectionTitles ? "Hábitos e fatores sociais relevantes ao cuidado." : null}
            >
                <div className="space-y-8">
                    <div>
                        <FieldLabel>Etilismo</FieldLabel>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <RSelect
                                label="Frequência"
                                value={v.etilismoFrequencia}
                                onChange={(x) => patch("etilismoFrequencia", x)}
                                options={[
                                    opt("social", "Social"),
                                    opt("todos_os_dias", "Todos os dias"),
                                    opt("3x_semana", "Três vezes por semana"),
                                    opt(">3x_semana", "Mais que três vezes por semana"),
                                ]}
                                isDisabled={readOnly}
                            />
                            <Text label="Tipo" value={v.etilismoTipo} onChange={(x) => patch("etilismoTipo", x)} readOnly={readOnly}/>
                            <Text label="Quantidade" value={v.etilismoQuantidade} onChange={(x) => patch("etilismoQuantidade", x)} readOnly={readOnly}/>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <RSelect
                            label="Tabagista"
                            value={v.tabagista}
                            onChange={(x) => patch("tabagista", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não"), opt("ex", "Ex-tabagista")]}
                            isDisabled={readOnly}
                        />
                        <Text label="Cigarros/dia" type="number" value={v.cigarrosDia} onChange={(x) => patch("cigarrosDia", x)} readOnly={readOnly}/>
                        <Text label="Ex-tabagista há quanto tempo" value={v.exTabagistaTempo} onChange={(x) => patch("exTabagistaTempo", x)} readOnly={readOnly}/>
                    </div>
                </div>
            </FormSection>

            {/* 3) Psicobiológicas */}
            <FormSection
                title={showSectionTitles ? "Necessidades Psicobiológicas" : null}
                description={showSectionTitles ? "Rotinas de cuidado, sono, nutrição e atividades." : null}
            >
                <div className="space-y-10">
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">Cuidado corporal</h3>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <Text label="Higiene corporal (freq./dia)" value={v.higieneCorporal} onChange={(x) => patch("higieneCorporal", x)} readOnly={readOnly}/>
                            <Text label="Higiene bucal (freq./dia)" value={v.higieneBucal} onChange={(x) => patch("higieneBucal", x)} readOnly={readOnly}/>
                            <RSelect
                                label="Uso de prótese"
                                value={v.protese}
                                onChange={(x) => patch("protese", x)}
                                options={[opt("sim", "Sim"), opt("nao", "Não")]}
                                isDisabled={readOnly}
                            />
                        </div>

                        <div className="mt-4">
                            <RSelect
                                label="Sono, repouso e conforto"
                                value={v.sonoRepousoConforto}
                                onChange={(x) => patch("sonoRepousoConforto", x)}
                                options={[opt("satisfeito", "Satisfeito"), opt("insatisfeito", "Insatisfeito")]}
                                isDisabled={readOnly}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">Nutrição e hidratação</h3>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <RSelect
                                label="Alimentação principal"
                                value={v.alimentacaoTipo}
                                onChange={(x) => patch("alimentacaoTipo", x)}
                                options={[
                                    opt("frutas", "Rica em frutas"),
                                    opt("gordura", "Rica em gordura"),
                                    opt("carboidratos", "Rica em carboidratos"),
                                ]}
                                isDisabled={readOnly}
                            />
                            <RSelect
                                label="Composição"
                                value={v.alimentacaoComposicao}
                                onChange={(x) => patch("alimentacaoComposicao", x)}
                                options={[
                                    opt("fibras", "Rica em fibras"),
                                    opt("proteina", "Rica em proteína"),
                                    opt("legumes_verduras", "Rica em legumes e verduras"),
                                ]}
                                isDisabled={readOnly}
                            />
                            <Text
                                label="Hidratação (água/suco) - quantidade/dia"
                                value={v.hidratacaoQuantidade}
                                onChange={(x) => patch("hidratacaoQuantidade", x)}
                                readOnly={readOnly}
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        <RSelect
                            label="Atividade física"
                            value={v.atividadeFisica}
                            onChange={(x) => patch("atividadeFisica", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não")]}
                            isDisabled={readOnly}
                        />
                        <RSelect
                            label="Recreação (frequência)"
                            value={v.recreacaoFreq}
                            onChange={(x) => patch("recreacaoFreq", x)}
                            options={[opt("3x_semana", "Três vezes/semana"), opt(">3x_semana", "Mais de três vezes/semana")]}
                            isDisabled={readOnly}
                        />
                        <Text label="Duração" value={v.recreacaoDuracao} onChange={(x) => patch("recreacaoDuracao", x)} readOnly={readOnly}/>
                    </div>
                </div>
            </FormSection>

            {/* 4) Condições de Moradia */}
            <FormSection
                title={showSectionTitles ? "Condições de Moradia" : null}
                description={showSectionTitles ? "Infraestrutura, saneamento e composição familiar." : null}
            >
                <div className="space-y-8">
                    <RSelect
                        label="Moradia"
                        value={v.moradia}
                        onChange={(x) => patch("moradia", x)}
                        options={[opt("propria", "Própria"), opt("cedida", "Cedida"), opt("alugada", "Alugada")]}
                        isDisabled={readOnly}
                    />

                    <div className="grid gap-6 sm:grid-cols-3">
                        <RSelect
                            label="Energia elétrica"
                            value={v.energiaEletrica}
                            onChange={(x) => patch("energiaEletrica", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não")]}
                            isDisabled={readOnly}
                        />
                        <RSelect
                            label="Água tratada"
                            value={v.aguaTratada}
                            onChange={(x) => patch("aguaTratada", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não")]}
                            isDisabled={readOnly}
                        />
                        <RSelect
                            label="Coleta de lixo"
                            value={v.coletaLixo}
                            onChange={(x) => patch("coletaLixo", x)}
                            options={[opt("sim", "Sim"), opt("nao", "Não")]}
                            isDisabled={readOnly}
                        />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <Text label="Quantos residem" type="number" value={v.qtdResidem} onChange={(x) => patch("qtdResidem", x)} readOnly={readOnly}/>
                        <Text label="Quantos trabalham" type="number" value={v.qtdTrabalham} onChange={(x) => patch("qtdTrabalham", x)} readOnly={readOnly}/>
                    </div>
                </div>
            </FormSection>

            {/* 5) Medidas e Sinais */}
            <FormSection
                title={showSectionTitles ? "Medidas e Sinais" : null}
                description={showSectionTitles ? "Registre medidas vitais e observações finais." : null}
            >
                <div className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-3">
                        <Text label="Peso (kg)" type="number" value={v.pesoKg} onChange={(x) => patch("pesoKg", x)} readOnly={readOnly}/>
                        <Text label="Altura (cm)" type="number" value={v.alturaCm} onChange={(x) => patch("alturaCm", x)} readOnly={readOnly}/>
                        <Text label="Glicemia capilar" value={v.glicemiaCapilar} onChange={(x) => patch("glicemiaCapilar", x)} readOnly={readOnly}/>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Text label="PA Sistólica" type="number" value={v.paSistolica} onChange={(x) => patch("paSistolica", x)} readOnly={readOnly}/>
                        <Text label="PA Diastólica" type="number" value={v.paDiastolica} onChange={(x) => patch("paDiastolica", x)} readOnly={readOnly}/>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}

/* ------------------------------ UI + helpers ------------------------------ */

function FormSection({ title, description, children }) {
    return (
        <section className="space-y-6">
            {title && (
                <header className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                </header>
            )}
            <div className="mt-4 space-y-6">{children}</div>
        </section>
    );
}

function FieldLabel({ children }) {
    return (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
            {children}
        </span>
    );
}

function Text({ label, value, onChange, readOnly, ...props }) {
    return (
        <label className="block">
            <FieldLabel>{label}</FieldLabel>
            <input
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                {...props}
            />
        </label>
    );
}

function Area({ label, value, onChange, rows = 4, readOnly }) {
    return (
        <label className="block">
            <FieldLabel>{label}</FieldLabel>
            <textarea
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                rows={rows}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
            />
        </label>
    );
}

// mesmos estilos usados no RecordForm
const rsStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 44,
        borderRadius: 12,
        borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
        "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#D1D5DB" },
        backgroundColor: state.isDisabled ? "#F3F4F6" : "white",
    }),
    menu: (base) => ({ ...base, zIndex: 40, borderRadius: 12, overflow: "hidden", marginTop: 4 }),
    menuList: (base) => ({ ...base, padding: 0, borderRadius: 12 }),
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

function RSelect({ label, value, onChange, options, placeholder = "Selecione", isDisabled }) {
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
                isDisabled={isDisabled}
            />
        </label>
    );
}

const opt = (value, label) => ({ value, label });

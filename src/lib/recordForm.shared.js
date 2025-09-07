// src/lib/recordForm.shared.js

/* =========================
 * Datas
 * ========================= */

// YYYY-MM-DD -> DD/MM/YYYY
export function toDateBR(v) {
    if (!v) return v;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        const [y, m, d] = v.split("-");
        return `${d}/${m}/${y}`;
    }
    return v;
}

// DD/MM/AAAA -> YYYY-MM-DD
export function brToISO(br) {
    if (!br) return "";
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
    if (!m) return br;
    const [, d, mo, y] = m;
    return `${y}-${mo}-${d}`;
}

/* =========================
 * Utils de merge/sanitização
 * ========================= */

export function isEmpty(v) {
    return (
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0)
    );
}

// Deep merge preferindo A; se A vazio, usa B (estável p/ arrays/objetos)
export function deepMergePreferA(a, b) {
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

// remove pares { k: undefined | null | "" } e objetos/arrays vazios
export function prune(o) {
    if (o == null) return null;
    if (Array.isArray(o)) {
        const arr = o.map(prune).filter((v) => v != null);
        return arr.length ? arr : null;
    }
    if (typeof o === "object") {
        const out = {};
        for (const [k, v] of Object.entries(o)) {
            const nv = typeof v === "string" && v.trim() === "" ? null : prune(v);
            if (nv != null) out[k] = nv;
        }
        return Object.keys(out).length ? out : null;
    }
    return o;
}

// seções opcionais: se ficarem “vazias” após prune, removemos do payload
export function sanitizeForCreate(p) {
    const x = { ...p };

    if (x.cuidadoCorporal) x.cuidadoCorporal = prune(x.cuidadoCorporal);
    if (x.nutricaoHidratacao) x.nutricaoHidratacao = prune(x.nutricaoHidratacao);
    if (x.recreacao) x.recreacao = prune(x.recreacao);
    if (x.moradia) x.moradia = prune(x.moradia);

    if (x.informante && !x.informante.tipo) x.informante = null;
    if (x.religiao && !x.religiao.nome) x.religiao = null;
    if (x.tabagismo) x.tabagismo = prune(x.tabagismo);

    return prune(x);
}

/* =========================
 * form ⇄ servidor
 * ========================= */

// servidor -> form (usado no modo EDIT)
export function serverToForm(rec = {}) {
    return {
        // Passo 1
        nome: rec.nome || "",
        dataAtendimento: brToISO(rec.dataAtendimento),
        naturalidade: rec.naturalidade || "",
        religiao: rec.religiao?.nome || "",
        sexo: rec.sexo || "",
        idade: rec.idade ?? "",
        filhos: rec.filhosQuantos ?? "",
        raca: rec.raca || "",
        estadoCivil: rec.estadoCivil || "",
        escolaridade: rec.escolaridade || "",
        profissao: rec.profissao || "",
        ocupacao: rec.ocupacao || "",
        diagnosticoMedicoAtual: rec.diagnosticoMedicoAtual || "",
        informante: (() => {
            const map = {
                Paciente: "paciente",
                "Membro da Família": "membro_familia",
                Amigo: "amigo",
                Outros: "outros",
            };
            return map[rec.informante?.tipo] || "";
        })(),
        hda: rec.hda || "",
        hp: rec.hp || "",
        medicamentosUsuais: rec.medicamentosUsuais || "",
        internacaoAnterior: rec.internacaoAnterior?.teve ? "sim" : "nao",
        internacaoOndeQuando: rec.internacaoAnterior?.ondeQuando || "",
        internacaoMotivos: rec.internacaoAnterior?.motivos || "",
        hf_DM: !!rec.historiaFamiliar?.dm,
        hf_HAS: !!rec.historiaFamiliar?.has,
        hf_Cardiopatias: !!rec.historiaFamiliar?.cardiopatias,
        hf_Enxaqueca: !!rec.historiaFamiliar?.enxaqueca,
        hf_TBC: !!rec.historiaFamiliar?.tbc,
        hf_CA: !!rec.historiaFamiliar?.ca,

        // Passo 2
        etilismoFrequencia: (() => {
            const map = {
                Social: "social",
                "Todos os dias": "todos_os_dias",
                "Três vezes por semana": "3x_semana",
                "Mais que três vezes por semana": ">3x_semana",
            };
            return map[rec.etilismo?.frequencia] || "";
        })(),
        etilismoTipo: rec.etilismo?.tipo || "",
        etilismoQuantidade: rec.etilismo?.quantidade || "",
        tabagista: rec.tabagismo?.tabagista ? "sim" : rec.tabagismo ? "nao" : "",
        cigarrosDia: rec.tabagismo?.cigarrosPorDia ?? "",
        exTabagistaTempo: rec.tabagismo?.exTabagistaHaQuantoTempo || "",

        // Passo 3
        higieneCorporal: rec.cuidadoCorporal?.higieneCorporalFrequenciaDia || "",
        higieneBucal: rec.cuidadoCorporal?.higieneBucalFrequenciaDia || "",
        protese: rec.cuidadoCorporal?.usoProtese ? "sim" : "nao",
        sonoRepousoConforto:
            rec.sonoRepousoConforto?.satisfacao === "Insatisfeito"
                ? "insatisfeito"
                : rec.sonoRepousoConforto?.satisfacao === "Satisfeito"
                    ? "satisfeito"
                    : "",
        alimentacaoTipo: (() => {
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmGordura) return "gordura";
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmCarboidratos) return "carboidratos";
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmFrutas) return "frutas";
            return "";
        })(),
        alimentacaoComposicao: (() => {
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmFibras) return "fibras";
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmProteina) return "proteina";
            if (rec.nutricaoHidratacao?.alimentacao?.ricaEmLegumesEVerduras)
                return "legumes_verduras";
            return "";
        })(),
        hidratacaoQuantidade: rec.nutricaoHidratacao?.hidratacao?.aguaQuantidadeDia || "",
        atividadeFisica: rec.atividadeFisica?.pratica ? "sim" : "nao",
        recreacaoFreq: (() => {
            const map = {
                "Três vezes/semana": "3x_semana",
                "Mais de três vezes/semana": ">3x_semana",
            };
            return map[rec.recreacao?.frequencia] || "";
        })(),
        recreacaoDuracao: rec.recreacao?.duracao || "",

        // Passo 4
        moradia: (() => {
            const map = { Própria: "propria", Cedida: "cedida", Alugada: "alugada" };
            return map[rec.moradia?.tipo] || "";
        })(),
        energiaEletrica: rec.moradia?.energiaEletrica ? "sim" : "nao",
        aguaTratada: rec.moradia?.aguaTratada ? "sim" : "nao",
        coletaLixo: rec.moradia?.coletaDeLixo ? "sim" : "nao",
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

// form -> servidor (create/update)
export function formToServer(form = {}) {
    return {
        nome: form.nome || "",
        dataAtendimento: toDateBR(form.dataAtendimento), // backend recebe DD/MM/AAAA
        naturalidade: form.naturalidade || "",
        religiao: form.religiao ? { nome: form.religiao } : null,
        sexo: form.sexo || "",
        idade: form.idade !== "" && form.idade !== undefined ? Number(form.idade) : null,
        filhosQuantos:
            form.filhos !== "" && form.filhos !== undefined ? Number(form.filhos) : null,
        raca: form.raca || "",
        estadoCivil: form.estadoCivil || "",
        escolaridade: form.escolaridade || "",
        profissao: form.profissao || "",
        ocupacao: form.ocupacao || "",
        diagnosticoMedicoAtual: form.diagnosticoMedicoAtual || "",
        informante: form.informante
            ? {
                tipo: {
                    paciente: "Paciente",
                    membro_familia: "Membro da Família",
                    amigo: "Amigo",
                    outros: "Outros",
                }[form.informante] || form.informante,
            }
            : null,
        hda: form.hda || "",
        hp: form.hp || "",
        medicamentosUsuais: form.medicamentosUsuais || "",

        internacaoAnterior:
            form.internacaoAnterior === "sim"
                ? {
                    teve: true,
                    ondeQuando: form.internacaoOndeQuando || "",
                    motivos: form.internacaoMotivos || "",
                }
                : { teve: false },

        historiaFamiliar: {
            dm: !!form.hf_DM,
            has: !!form.hf_HAS,
            cardiopatias: !!form.hf_Cardiopatias,
            enxaqueca: !!form.hf_Enxaqueca,
            tbc: !!form.hf_TBC,
            ca: !!form.hf_CA,
        },

        etilismo:
            form.etilismoFrequencia || form.etilismoTipo || form.etilismoQuantidade
                ? {
                    frequencia:
                        {
                            social: "Social",
                            todos_os_dias: "Todos os dias",
                            "3x_semana": "Três vezes por semana",
                            ">3x_semana": "Mais que três vezes por semana",
                        }[form.etilismoFrequencia] || undefined,
                    tipo: form.etilismoTipo || "",
                    quantidade: form.etilismoQuantidade || "",
                }
                : null,

        tabagismo: form.tabagista
            ? {
                tabagista: form.tabagista === "sim",
                cigarrosPorDia:
                    form.cigarrosDia !== "" && form.cigarrosDia !== undefined
                        ? Number(form.cigarrosDia)
                        : null,
                exTabagistaHaQuantoTempo: form.exTabagistaTempo || "",
            }
            : null,

        cuidadoCorporal: {
            higieneCorporalFrequenciaDia: form.higieneCorporal || "",
            higieneBucalFrequenciaDia: form.higieneBucal || "",
            usoProtese: form.protese === "sim",
        },

        sonoRepousoConforto: form.sonoRepousoConforto
            ? {
                satisfacao:
                    form.sonoRepousoConforto === "satisfeito" ? "Satisfeito" : "Insatisfeito",
            }
            : null,

        nutricaoHidratacao: {
            alimentacao: {
                ricaEmFrutas: form.alimentacaoTipo === "frutas",
                ricaEmGordura: form.alimentacaoTipo === "gordura",
                ricaEmCarboidratos: form.alimentacaoTipo === "carboidratos",
                ricaEmFibras: form.alimentacaoComposicao === "fibras",
                ricaEmProteina: form.alimentacaoComposicao === "proteina",
                ricaEmLegumesEVerduras: form.alimentacaoComposicao === "legumes_verduras",
            },
            hidratacao: {
                aguaQuantidadeDia: form.hidratacaoQuantidade || "",
            },
        },

        atividadeFisica: { pratica: form.atividadeFisica === "sim" },

        recreacao:
            form.recreacaoFreq || form.recreacaoDuracao
                ? {
                    frequencia:
                        {
                            "3x_semana": "Três vezes/semana",
                            ">3x_semana": "Mais de três vezes/semana",
                        }[form.recreacaoFreq] || undefined,
                    duracao: form.recreacaoDuracao || "",
                }
                : null,

        moradia: {
            tipo:
                {
                    propria: "Própria",
                    cedida: "Cedida",
                    alugada: "Alugada",
                }[form.moradia] || undefined,
            energiaEletrica: form.energiaEletrica === "sim",
            aguaTratada: form.aguaTratada === "sim",
            coletaDeLixo: form.coletaLixo === "sim",
            quantosResidem:
                form.qtdResidem !== "" && form.qtdResidem !== undefined
                    ? Number(form.qtdResidem)
                    : null,
            quantosTrabalham:
                form.qtdTrabalham !== "" && form.qtdTrabalham !== undefined
                    ? Number(form.qtdTrabalham)
                    : null,
        },

        pesoKg:
            form.pesoKg !== "" && form.pesoKg !== undefined ? Number(form.pesoKg) : null,
        alturaCm:
            form.alturaCm !== "" && form.alturaCm !== undefined
                ? Number(form.alturaCm)
                : null,
        glicemiaCapilar: form.glicemiaCapilar || "",
        paSistolica:
            form.paSistolica !== "" && form.paSistolica !== undefined
                ? Number(form.paSistolica)
                : null,
        paDiastolica:
            form.paDiastolica !== "" && form.paDiastolica !== undefined
                ? Number(form.paDiastolica)
                : null,
    };
}

/* =========================
 * Normalização OCR -> form
 * ========================= */

export function schemaToForm(rec = {}) {
    const mapInf = (s) => {
        const m = {
            Paciente: "paciente",
            "Membro da Família": "membro_familia",
            Amigo: "amigo",
            Outros: "outros",
        };
        return m[s] || "";
    };
    const pick = (o, k, d = "") => (o && o[k] != null ? o[k] : d);
    const yn = (b) => (b ? "sim" : "nao");

    return {
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

        etilismoFrequencia:
            (
                {
                    Social: "social",
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

        higieneCorporal: pick(rec.cuidadoCorporal, "higieneCorporalFrequenciaDia", ""),
        higieneBucal: pick(rec.cuidadoCorporal, "higieneBucalFrequenciaDia", ""),
        protese: yn(!!rec.cuidadoCorporal?.usoProtese),
        sonoRepousoConforto:
            (
                {
                    Satisfeito: "satisfeito",
                    Insatisfeito: "insatisfeito",
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
        hidratacaoQuantidade: pick(
            rec.nutricaoHidratacao?.hidratacao,
            "aguaQuantidadeDia",
            ""
        ),

        atividadeFisica: yn(!!rec.atividadeFisica?.pratica),
        recreacaoFreq:
            (
                {
                    "Três vezes/semana": "3x_semana",
                    "Mais de três vezes/semana": ">3x_semana",
                }
            )[pick(rec.recreacao, "frequencia", "")] || "",
        recreacaoDuracao: pick(rec.recreacao, "duracao", ""),

        moradia:
            (
                {
                    Própria: "propria",
                    Cedida: "cedida",
                    Alugada: "alugada",
                }
            )[pick(rec.moradia, "tipo", "")] || "",
        energiaEletrica: yn(!!rec.moradia?.energiaEletrica),
        aguaTratada: yn(!!rec.moradia?.aguaTratada),
        coletaLixo: yn(!!rec.moradia?.coletaDeLixo),
        qtdResidem: rec.moradia?.quantosResidem ?? "",
        qtdTrabalham: rec.moradia?.quantosTrabalham ?? "",

        pesoKg: rec.pesoKg ?? "",
        alturaCm: rec.alturaCm ?? "",
        glicemiaCapilar: rec.glicemiaCapilar || "",
        paSistolica: rec.paSistolica ?? "",
        paDiastolica: rec.paDiastolica ?? "",
    };
}

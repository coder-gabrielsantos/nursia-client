export function schemaToForm(rec = {}) {
    // Helpers
    const mapInformante = (s) => {
        const m = { "Paciente": "paciente", "Membro da Família": "membro_familia", "Amigo": "amigo", "Outros": "outros" };
        return m[s] || "";
    };
    const dateToISO = (br) => {
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || "");
        return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
    };
    const yn = (b) => (b ? "sim" : "nao");

    return {
        // Passo 1
        nome: rec.nome || "",
        dataAtendimento: dateToISO(rec.dataAtendimento),
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
        informante: mapInformante(rec.informante?.tipo),
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
        etilismoFrequencia: ({
            "Social": "social",
            "Todos os dias": "todos_os_dias",
            "Três vezes por semana": "3x_semana",
            "Mais que três vezes por semana": ">3x_semana",
        })[rec.etilismo?.frequencia] || "",
        etilismoTipo: rec.etilismo?.tipo || "",
        etilismoQuantidade: rec.etilismo?.quantidade || "",
        tabagista: rec.tabagismo ? (rec.tabagismo.tabagista ? "sim" : "nao") : "",
        cigarrosDia: rec.tabagismo?.cigarrosPorDia ?? "",
        exTabagistaTempo: rec.tabagismo?.exTabagistaHaQuantoTempo || "",

        // Passo 3
        higieneCorporal: rec.cuidadoCorporal?.higieneCorporalFrequenciaDia || "",
        higieneBucal: rec.cuidadoCorporal?.higieneBucalFrequenciaDia || "",
        protese: yn(!!rec.cuidadoCorporal?.usoProtese),
        sonoRepousoConforto: ({
            "Satisfeito": "satisfeito",
            "Insatisfeito": "insatisfeito"
        })[rec.sonoRepousoConforto?.satisfacao] || "",
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
        hidratacaoQuantidade: rec.nutricaoHidratacao?.hidratacao?.aguaQuantidadeDia || "",

        atividadeFisica: yn(!!rec.atividadeFisica?.pratica),
        recreacaoFreq: ({
            "Três vezes/semana": "3x_semana",
            "Mais de três vezes/semana": ">3x_semana"
        })[rec.recreacao?.frequencia] || "",
        recreacaoDuracao: rec.recreacao?.duracao || "",

        // Passo 4
        moradia: ({
            "Própria": "propria", "Cedida": "cedida", "Alugada": "alugada"
        })[rec.moradia?.tipo] || "",
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

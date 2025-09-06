import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "nursia:drafts";

// helpers de storage
function readAll() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
}

function writeAll(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export function createDraft(initial = {}) {
    const id = `${Date.now()}`; // simples e único
    const all = readAll();
    all[id] = {
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        step: 1,
        data: initial,
    };
    writeAll(all);
    return id;
}

export function getDraft(id) {
    const all = readAll();
    return all[id] || null;
}

export function listDrafts() {
    const all = readAll();
    return Object.values(all).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function deleteDraft(id) {
    const all = readAll();
    delete all[id];
    writeAll(all);
}

export default function useRecordDraft(draftId) {
    const [draft, setDraft] = useState(() => getDraft(draftId));
    const dirty = useRef(false);

    useEffect(() => {
        const d = getDraft(draftId);
        if (d) setDraft(d);
    }, [draftId]);

    // autosave a cada 600ms quando algo muda
    useEffect(() => {
        if (!draft) return;
        if (!dirty.current) return;
        const t = setTimeout(() => {
            const all = readAll();
            all[draft.id] = { ...draft, updatedAt: new Date().toISOString() };
            writeAll(all);
            dirty.current = false;
        }, 600);
        return () => clearTimeout(t);
    }, [draft]);

    function update(partial) {
        dirty.current = true;
        setDraft((d) => ({ ...d, ...partial }));
    }

    function updateData(partial) {
        dirty.current = true;
        setDraft((d) => ({ ...d, data: { ...(d?.data || {}), ...partial } }));
    }

    const progress = useMemo(() => {
        // 5 passos iguais: 20% por passo (ou refine depois por campos)
        const step = draft?.step || 1;
        return Math.min(100, Math.max(0, Math.round((step - 1) * 20)));
    }, [draft?.step]);

    return { draft, setDraft: update, updateData, progress, refresh: () => setDraft(getDraft(draftId)) };
}

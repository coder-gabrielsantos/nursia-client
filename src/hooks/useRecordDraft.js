// src/hooks/useRecordDraft.js
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "nursia:drafts";

/* ----------------------------- Storage helpers ---------------------------- */
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

/* ----------------------------- Public utilities --------------------------- */
export function createDraft(initial = {}) {
    const id = `${Date.now()}`; // simple unique id
    const all = readAll();
    const now = new Date().toISOString();
    all[id] = {
        id,
        createdAt: now,
        updatedAt: now,
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
    return Object.values(all).sort((a, b) =>
        (b.updatedAt || "").localeCompare(a.updatedAt || "")
    );
}

export function deleteDraft(id) {
    const all = readAll();
    delete all[id];
    writeAll(all);
}

/* --------------------------------- Hook ----------------------------------- */
export default function useRecordDraft(draftId) {
    const [draft, setDraft] = useState(() => getDraft(draftId));

    // Controls
    const dirty = useRef(false);
    const autosaveTimer = useRef(null);
    const disabled = useRef(false); // when true, autosave is suspended

    // Load draft when id changes
    useEffect(() => {
        const d = getDraft(draftId);
        if (d) setDraft(d);
        // re-enable autosave for a new draft id
        disabled.current = false;
        dirty.current = false;
        if (autosaveTimer.current) {
            clearTimeout(autosaveTimer.current);
            autosaveTimer.current = null;
        }
    }, [draftId]);

    // Autosave every 600ms when something changes
    useEffect(() => {
        if (!draft) return;
        if (!dirty.current || disabled.current) return;

        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            const all = readAll();
            const patched = { ...draft, updatedAt: new Date().toISOString() };
            all[draft.id] = patched;
            writeAll(all);
            dirty.current = false;
            autosaveTimer.current = null;
        }, 600);

        return () => {
            if (autosaveTimer.current) {
                clearTimeout(autosaveTimer.current);
                autosaveTimer.current = null;
            }
        };
    }, [draft]);

    /* ------------------------------- Mutators -------------------------------- */
    function update(partial) {
        dirty.current = true;
        setDraft((d) => ({ ...d, ...partial }));
    }

    function updateData(partial) {
        dirty.current = true;
        setDraft((d) => ({ ...d, data: { ...(d?.data || {}), ...partial } }));
    }

    /** Immediately suspend autosave (no more writes to localStorage). */
    function suspendAutosave() {
        disabled.current = true;
        if (autosaveTimer.current) {
            clearTimeout(autosaveTimer.current);
            autosaveTimer.current = null;
        }
    }

    /** Remove current draft and disable autosave permanently for this instance. */
    function removeDraft() {
        suspendAutosave();
        if (draft?.id) {
            const all = readAll();
            delete all[draft.id];
            writeAll(all);
        }
        setDraft(null);
    }

    /* ----------------------------- Derivatives ------------------------------- */
    // 5 equal steps => 0%, 20%, 40%, 60%, 80% (fine for a simple visual cue)
    const progress = useMemo(() => {
        const step = draft?.step || 1;
        return Math.min(100, Math.max(0, Math.round((step - 1) * 20)));
    }, [draft?.step]);

    function refresh() {
        setDraft(getDraft(draftId));
    }

    return {
        draft,
        setDraft: update,
        updateData,
        progress,
        suspendAutosave,
        removeDraft,
        refresh,
    };
}

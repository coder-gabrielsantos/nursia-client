import axios from "axios";

// Base da API — usa Vite env var e fallback local para dev
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Instância principal com interceptors:
 * - Request: injeta `x-access-password` e `x-admin-key` a partir do sessionStorage
 * - Response: ao receber 401/403, limpa sessão e redireciona para /login
 */
export const api = axios.create({ baseURL: API_BASE_URL });

/* --------------------------- Request interceptor --------------------------- */
api.interceptors.request.use((config) => {
    const accessKey = sessionStorage.getItem("nursia_access_key");
    const adminKey = sessionStorage.getItem("nursia_admin_key");
    if (accessKey) config.headers["x-access-password"] = accessKey;
    if (adminKey) config.headers["x-admin-key"] = adminKey;
    return config;
});

/* --------------------------- Response interceptor -------------------------- */
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            // limpa sessão
            sessionStorage.removeItem("nursia_access_key");
            sessionStorage.removeItem("nursia_admin_key");
            sessionStorage.removeItem("nursia_role");
            // evita loop caso já esteja na tela de login
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                // opcional: guardar rota atual para pós-login
                // const r = encodeURIComponent(window.location.pathname + window.location.search);
                // window.location.assign(`/login?next=${r}`);
                window.location.assign("/login");
            }
        }
        // propaga o erro para tratamento local (toasts, etc.)
        return Promise.reject(error);
    }
);

/* ---------------------------------- Auth ---------------------------------- */
// Login com UMA senha + checkbox (asAdmin)
// Retorna: { role:'nurse'|'admin', accessKey, adminKey? }
// Obs: usamos axios "puro" para não injetar headers no /auth/login.
export async function loginWithSinglePassword({ password, asAdmin }) {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        password,
        asAdmin: !!asAdmin,
    });
    return data;
}

export async function setRolePassword({ target, newPassword }) {
    const res = await api.put('/auth/password', { target, newPassword });
    return res.data;
}

/* ----------------------------- Nursing Records ---------------------------- */
export async function listRecords(params = {}) {
    const { q } = params;
    const res = await api.get("/records", { params: q ? { q } : undefined });
    return res.data;
}

export async function createRecord(payload) {
    const res = await api.post("/records", payload);
    return res.data;
}

export async function getRecord(id) {
    const res = await api.get(`/records/${id}`);
    return res.data;
}

export async function updateRecord(id, payload) {
    const res = await api.patch(`/records/${id}`, payload);
    return res.data;
}

export async function deleteRecord(id) {
    const res = await api.delete(`/records/${id}`);
    return res.data;
}

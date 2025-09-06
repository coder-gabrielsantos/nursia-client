import axios from "axios";

// Use a env var e mantenha um fallback local para dev
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor: injeta as chaves em TODAS as requisições
// - x-access-password: validação geral (checkAccess)
// - x-admin-key: permissões administrativas (checkAdmin)
api.interceptors.request.use((config) => {
    const accessKey = sessionStorage.getItem("nursia_access_key");
    const adminKey = sessionStorage.getItem("nursia_admin_key");
    if (accessKey) config.headers["x-access-password"] = accessKey;
    if (adminKey) config.headers["x-admin-key"] = adminKey;
    return config;
});

/** NOVO: login com uma senha + checkbox (asAdmin) */
export async function loginWithSinglePassword({ password, asAdmin }) {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        password,
        asAdmin: !!asAdmin,
    });
    // data: { role:'nurse'|'admin', accessKey, adminKey? }
    return data;
}

/** (Opcional) Antigo "verifyAccessKey" pode ser aposentado */
export async function verifyAccessKey(key) {
    try {
        const res = await axios.get(`${API_BASE_URL}/records`, {
            headers: { "x-access-password": key },
            withCredentials: false,
        });
        return { ok: true, data: res.data };
    } catch (err) {
        const msg =
            err?.response?.data?.error ||
            (err?.response?.status === 401 ? "Chave inválida" : "Falha de conexão");
        return { ok: false, error: msg };
    }
}

/** Lista prontuários (filtro opcional por nome via ?q=) */
export async function listRecords(params = {}) {
    const { q } = params;
    const res = await api.get("/records", { params: { q } });
    return res.data;
}

/** Cria prontuário (exige admin) */
export async function createRecord(payload) {
    const res = await api.post("/records", payload);
    return res.data;
}

/** Lê prontuário */
export async function getRecord(id) {
    const res = await api.get(`/records/${id}`);
    return res.data;
}

/** Atualiza prontuário (exige admin) */
export async function updateRecord(id, payload) {
    const res = await api.put(`/records/${id}`, payload);
    return res.data;
}

/** Exclui prontuário (exige admin) */
export async function deleteRecord(id) {
    const res = await api.delete(`/records/${id}`);
    return res.data;
}

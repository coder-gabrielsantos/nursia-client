import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// injeta a chave em todas as requisições
api.interceptors.request.use((config) => {
    const key = sessionStorage.getItem("nursia_access_key");
    if (key) {
        config.headers["x-access-password"] = key;
    }
    return config;
});

export async function verifyAccessKey(key) {
    // testa a chave sem gravar: chama um endpoint protegido
    try {
        const res = await axios.get(`${API_BASE_URL}/records`, {
            headers: { "x-access-password": key },
            // se você hospedar com CORS, mantenha credentials conforme seu backend
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

export async function listRecords(params = {}) {
    const { q } = params;
    const res = await api.get("/records", { params: { q } });
    return res.data; // array
}

export async function createRecord(payload) {
    const res = await api.post("/records", payload);
    return res.data; // objeto criado
}

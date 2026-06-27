import axios from "axios";

// En local dev, VITE_API_URL está vacío → las peticiones van al proxy de Vite (mismo origen).
// En producción, Vercel define VITE_API_URL con la URL real del backend.
const API_URL = import.meta.env.VITE_API_URL || "";
if (API_URL) {
  axios.defaults.baseURL = API_URL;
}
// Las cookies httpOnly se envían automáticamente (no se necesita Authorization header)
axios.defaults.withCredentials = true;

// --- Interceptor de refresh automático ---
let refreshing = false;
let refreshQueue = [];

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skipRefresh =
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/login") ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/logout");

    if (skipRefresh) return Promise.reject(error);

    if (refreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => axios(original));
    }

    original._retry = true;
    refreshing = true;

    try {
      await axios.post("/auth/refresh");
      refreshQueue.forEach(({ resolve }) => resolve());
      refreshQueue = [];
      return axios(original);
    } catch {
      refreshQueue.forEach(({ reject: rej }) => rej());
      refreshQueue = [];
      window.dispatchEvent(new Event("session-expired"));
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  }
);

export async function login(username, password) {
  const res = await axios.post("/login", { username, password });
  return res.data;
}

export async function registro(payload) {
  const res = await axios.post("/registro", payload);
  return res.data;
}

export async function logout() {
  await axios.post("/logout");
}

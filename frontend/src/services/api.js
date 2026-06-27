import axios from "axios";

// Todas las peticiones pasan por el MISMO origen, bajo "/api", que un proxy
// reenvía al backend:
//   - En local: el proxy de Vite (ver vite.config.js).
//   - En producción: los rewrites de Vercel (ver vercel.json).
// Así las cookies httpOnly son de primera parte y funcionan en cualquier
// navegador (sin el bloqueo de cookies de terceros entre Vercel y Render).
axios.defaults.baseURL = "/api";
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

import axios from "axios";

// URL base del backend. En local puedes apuntar a tu servidor con un
// archivo .env.local que defina  VITE_API_URL=http://127.0.0.1:8000
// Si no existe, usa el backend de producción (Render).
export const API_URL = import.meta.env.VITE_API_URL || "https://postres-juli.onrender.com";

// Todas las peticiones de axios usarán esta base, así los componentes
// solo escriben rutas relativas como  "/clientes".
axios.defaults.baseURL = API_URL;

// Guarda (o quita) el token JWT en el header Authorization de TODAS las
// peticiones de axios.
export function setAuthToken(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export async function login(email, password) {
  const res = await axios.post("/login", { email, password });
  return res.data;
}

export async function registro(empresa_nombre, nombre, email, password) {
  const res = await axios.post("/registro", {
    empresa_nombre,
    nombre,
    email,
    password,
  });
  return res.data;
}

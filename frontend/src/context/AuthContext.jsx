import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { logout as apiLogout } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la app: el cookie de acceso se envía automáticamente si existe
  useEffect(() => {
    axios
      .get("/me")
      .then((res) => setUsuario(res.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // El interceptor en api.js emite este evento cuando el refresh falla
  useEffect(() => {
    const handleExpired = () => setUsuario(null);
    window.addEventListener("session-expired", handleExpired);
    return () => window.removeEventListener("session-expired", handleExpired);
  }, []);

  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const cerrarSesion = async () => {
    try {
      await apiLogout();
    } catch {
      // Continuar aunque falle la llamada al backend
    }
    setUsuario(null);
  };

  const refrescarUsuario = async () => {
    try {
      const res = await axios.get("/me");
      setUsuario(res.data);
    } catch {
      // Si falla, no romper la sesión actual
    }
  };

  // Cierre de sesión automático por inactividad (30 minutos)
  useEffect(() => {
    if (!usuario) return;

    const LIMITE = 30 * 60 * 1000;
    let timer;

    const reiniciar = () => {
      clearTimeout(timer);
      timer = setTimeout(cerrarSesion, LIMITE);
    };

    const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    eventos.forEach((e) => window.addEventListener(e, reiniciar));
    reiniciar();

    return () => {
      clearTimeout(timer);
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
    };
  }, [usuario]);

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, iniciarSesion, cerrarSesion, refrescarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

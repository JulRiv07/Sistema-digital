import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { setAuthToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la app: si hay token guardado, lo validamos contra /me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCargando(false);
      return;
    }

    setAuthToken(token);
    axios
      .get("/me")
      .then((res) => setUsuario(res.data))
      .catch(() => {
        // Token inválido o expirado -> limpiar sesión
        localStorage.removeItem("token");
        setAuthToken(null);
      })
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = (token, datosUsuario) => {
    localStorage.setItem("token", token);
    setAuthToken(token);
    setUsuario(datosUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

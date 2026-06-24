import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registro } from "../services/api";
import "./Auth.css";

function Registro({ irALogin }) {
  const { iniciarSesion } = useAuth();

  const [empresaNombre, setEmpresaNombre] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!empresaNombre || !nombre || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setCargando(true);
    try {
      const data = await registro(empresaNombre, nombre, email, password);
      iniciarSesion(data.access_token, data.usuario);
    } catch (err) {
      const detalle = err.response?.data?.detail;
      setError(detalle || "No se pudo crear la cuenta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">Sistema Digital</h1>
        <h2 className="auth-title">Crear empresa</h2>
        <p className="auth-subtitle">Registra tu negocio para empezar</p>

        <form className="form-container" onSubmit={handleSubmit}>
          <label>Nombre de la empresa</label>
          <input
            type="text"
            value={empresaNombre}
            onChange={(e) => setEmpresaNombre(e.target.value)}
            placeholder="Ej: Postres Juli"
          />

          <label>Tu nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juliana"
          />

          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta?{" "}
          <button type="button" className="auth-link" onClick={irALogin}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}

export default Registro;

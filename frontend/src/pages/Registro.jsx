import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { registro } from "../services/api";
import PasswordInput from "../components/PasswordInput";
import "./Auth.css";

function passwordValida(p) {
  return p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
}

function Registro({ irALogin }) {
  const { iniciarSesion } = useAuth();

  const [tipo, setTipo] = useState("empresario"); // "empresario" | "usuario"
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [empresaCodigo, setEmpresaCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombre || !username || !password) {
      setError("Completa tu nombre, usuario y contraseña");
      return;
    }
    const creaEmpresa = tipo === "empresario" || tipo === "propietaria";
    if (creaEmpresa && !empresaNombre) {
      setError("Escribe el nombre de tu empresa");
      return;
    }
    if (tipo === "usuario" && !empresaCodigo) {
      setError("Escribe el código de la empresa");
      return;
    }
    if (!passwordValida(password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, con letras y números");
      return;
    }

    setCargando(true);
    try {
      const data = await registro({
        tipo,
        nombre,
        username,
        password,
        email: email || null,
        empresa_nombre: creaEmpresa ? empresaNombre : null,
        empresa_codigo: tipo === "usuario" ? empresaCodigo : null,
      });
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
        <h2 className="auth-title">Crear cuenta</h2>

        <div className="auth-toggle">
          <button
            type="button"
            className={tipo === "empresario" ? "active" : ""}
            onClick={() => setTipo("empresario")}
          >
            Empresario
          </button>
          <button
            type="button"
            className={tipo === "propietaria" ? "active" : ""}
            onClick={() => setTipo("propietaria")}
          >
            Propietario
          </button>
          <button
            type="button"
            className={tipo === "usuario" ? "active" : ""}
            onClick={() => setTipo("usuario")}
          >
            Empleado
          </button>
        </div>

        <p className="auth-subtitle">
          {tipo === "empresario" &&
            "Creas tu empresa y solo la administras (no vendes). Puedes contratar empleados."}
          {tipo === "propietaria" &&
            "Vendes y administras tu empresa al mismo tiempo. Ideal si manejas el negocio tú mismo; también puedes contratar empleados después."}
          {tipo === "usuario" && "Únete a una empresa existente con su código."}
        </p>

        <form className="form-container" onSubmit={handleSubmit}>
          {tipo === "empresario" || tipo === "propietaria" ? (
            <>
              <label>Nombre de la empresa</label>
              <input
                type="text"
                value={empresaNombre}
                onChange={(e) => setEmpresaNombre(e.target.value)}
                placeholder="Ej: Mi Empresa"
              />
            </>
          ) : (
            <>
              <label>Código de la empresa</label>
              <input
                type="text"
                value={empresaCodigo}
                onChange={(e) => setEmpresaCodigo(e.target.value)}
                placeholder="Ej: A1B2C3D4"
              />
            </>
          )}

          <label>Tu nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Ana Pérez"
          />

          <label>Nombre de usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej: anaperez"
          />

          <label>Correo (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />

          <label>Contraseña</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="auth-hint">Mínimo 8 caracteres, con letras y números.</p>

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

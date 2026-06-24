import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";
import "./Auth.css";

function Login({ irARegistro }) {
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setCargando(true);
    try {
      const data = await login(email, password);
      iniciarSesion(data.access_token, data.usuario);
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">Sistema Digital</h1>
        <h2 className="auth-title">Iniciar sesión</h2>
        <p className="auth-subtitle">Bienvenid@ de nuevo</p>

        <form className="form-container" onSubmit={handleSubmit}>
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
            {cargando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta?{" "}
          <button type="button" className="auth-link" onClick={irARegistro}>
            Crear empresa
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

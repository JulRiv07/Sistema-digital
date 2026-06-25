import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";
import PasswordInput from "../components/PasswordInput";
import "./Auth.css";

function Login({ irARegistro }) {
  const { iniciarSesion } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Completa todos los campos");
      return;
    }

    setCargando(true);
    try {
      const data = await login(username, password);
      iniciarSesion(data.access_token, data.usuario);
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
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
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu nombre de usuario"
          />

          <label>Contraseña</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

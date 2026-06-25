import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Estadisticas from "./Estadisticas";
import PasswordInput from "./PasswordInput";
import "./PerfilPanel.css";

function PerfilPanel() {
  const { usuario, refrescarUsuario } = useAuth();

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [username, setUsername] = useState(usuario?.username || "");
  const [email, setEmail] = useState(usuario?.email || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  // Cambio de contraseña
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [msgPass, setMsgPass] = useState("");
  const [errPass, setErrPass] = useState("");

  const puedeOperar = usuario?.rol === "empleado" || usuario?.rol === "propietaria";

  useEffect(() => {
    if (!puedeOperar) return; // el empresario que solo supervisa no tiene stats propias
    axios
      .get("/perfil/estadisticas")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [puedeOperar]);

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await axios.put("/perfil", {
        nombre,
        username,
        email: email || null,
        telefono: telefono || null,
      });
      await refrescarUsuario();
      setMensaje("Perfil actualizado ✅");
      setTimeout(() => setMensaje(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "No se pudo guardar el perfil");
    }
  };

  const guardarPassword = async (e) => {
    e.preventDefault();
    setErrPass("");
    setMsgPass("");
    if (!actual || !nueva) {
      setErrPass("Completa los dos campos");
      return;
    }
    try {
      await axios.put("/perfil/password", { actual, nueva });
      setMsgPass("Contraseña actualizada ✅");
      setActual("");
      setNueva("");
      setTimeout(() => setMsgPass(""), 3000);
    } catch (err) {
      setErrPass(err.response?.data?.detail || "No se pudo cambiar la contraseña");
    }
  };

  return (
    <div className="perfil-panel">
      <h2 className="perfil-title">Mi perfil</h2>

      <section className="perfil-card">
        <h3>Mis datos</h3>
        {mensaje && <div className="perfil-aviso">{mensaje}</div>}
        {error && <div className="perfil-error">{error}</div>}

        <form className="form-container" onSubmit={guardar}>
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />

          <label>Nombre de usuario</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />

          <label>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="opcional"
          />

          <label>Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="opcional"
          />

          <button type="submit">Guardar cambios</button>
        </form>
      </section>

      <section className="perfil-card">
        <h3>Cambiar contraseña</h3>
        {msgPass && <div className="perfil-aviso">{msgPass}</div>}
        {errPass && <div className="perfil-error">{errPass}</div>}

        <form className="form-container" onSubmit={guardarPassword}>
          <label>Contraseña actual</label>
          <PasswordInput value={actual} onChange={(e) => setActual(e.target.value)} />

          <label>Nueva contraseña</label>
          <PasswordInput value={nueva} onChange={(e) => setNueva(e.target.value)} />
          <p className="perfil-hint">Mínimo 8 caracteres, con letras y números.</p>

          <button type="submit">Actualizar contraseña</button>
        </form>
      </section>

      {puedeOperar && (
        <section className="perfil-card">
          <h3>Mis estadísticas</h3>
          <Estadisticas stats={stats} />
        </section>
      )}
    </div>
  );
}

export default PerfilPanel;

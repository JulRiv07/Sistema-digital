import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Estadisticas from "./Estadisticas";
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

  const esAdmin = usuario?.rol === "admin";

  useEffect(() => {
    if (esAdmin) return; // el empresario no registra ventas, no tiene stats propias
    axios
      .get("/perfil/estadisticas")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [esAdmin]);

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

      {!esAdmin && (
        <section className="perfil-card">
          <h3>Mis estadísticas</h3>
          <Estadisticas stats={stats} />
        </section>
      )}
    </div>
  );
}

export default PerfilPanel;

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { leerImagenRedimensionada } from "../services/image";
import Modal from "./Modal";
import "./AdminPanel.css";

const TEMAS = [
  { id: "rosa", nombre: "Rosa", color: "#ca9f9f" },
  { id: "azul", nombre: "Azul", color: "#9fb0ca" },
  { id: "amarillo", nombre: "Amarillo", color: "#cabf9f" },
  { id: "verde", nombre: "Verde", color: "#9fcaa8" },
  { id: "lila", nombre: "Lila", color: "#b49fca" },
  { id: "oscuro", nombre: "Oscuro", color: "#2b2b34" },
];

function AdminPanel() {
  const { usuario, refrescarUsuario, cerrarSesion } = useAuth();

  const [empleados, setEmpleados] = useState([]);
  const [nombreEmpresa, setNombreEmpresa] = useState(usuario?.empresa_nombre || "");
  const [mensaje, setMensaje] = useState("");
  const [modalEliminar, setModalEliminar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargarEmpleados = () => {
    axios
      .get("/empresa/empleados")
      .then((res) => setEmpleados(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const aviso = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(usuario?.empresa_codigo || "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const subirLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await leerImagenRedimensionada(file, 256);
      await axios.put("/empresa/logo", { logo: dataUrl });
      await refrescarUsuario();
      aviso("Logo actualizado ✅");
    } catch {
      aviso("No se pudo subir el logo");
    }
  };

  const quitarLogo = async () => {
    try {
      await axios.put("/empresa/logo", { logo: null });
      await refrescarUsuario();
      aviso("Logo eliminado");
    } catch {
      aviso("No se pudo quitar el logo");
    }
  };

  const guardarNombre = async (e) => {
    e.preventDefault();
    if (!nombreEmpresa.trim()) return;
    try {
      await axios.put("/empresa/nombre", { nombre: nombreEmpresa.trim() });
      await refrescarUsuario();
      aviso("Nombre de la empresa actualizado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo actualizar el nombre");
    }
  };

  const cambiarRol = async (empleado, nuevoRol) => {
    try {
      await axios.put(`/empresa/empleados/${empleado.id}/rol`, { rol: nuevoRol });
      cargarEmpleados();
      aviso("Rol actualizado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo cambiar el rol");
    }
  };

  const cambiarTema = async (id) => {
    try {
      await axios.put("/empresa/tema", { tema: id });
      await refrescarUsuario();
      aviso("Tema actualizado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo cambiar el tema");
    }
  };

  const regenerarCodigo = async () => {
    if (!window.confirm("¿Generar un código nuevo? El anterior dejará de funcionar.")) return;
    try {
      await axios.put("/empresa/codigo/regenerar");
      await refrescarUsuario();
      aviso("Código regenerado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo regenerar el código");
    }
  };

  const quitarEmpleado = async (empleado) => {
    if (!window.confirm(`¿Quitar a ${empleado.nombre} de la empresa?`)) return;
    try {
      await axios.delete(`/empresa/empleados/${empleado.id}`);
      cargarEmpleados();
      aviso("Empleado quitado ✅");
    } catch (err) {
      aviso(err.response?.data?.detail || "No se pudo quitar al empleado");
    }
  };

  const eliminarEmpresa = async () => {
    try {
      await axios.delete("/empresa");
      cerrarSesion();
    } catch (err) {
      setModalEliminar(false);
      aviso(err.response?.data?.detail || "No se pudo eliminar la empresa");
    }
  };

  const rolLabel = (rol) => (rol === "admin" ? "Empresario" : "Empleado");

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Administración</h2>

      {mensaje && <div className="admin-aviso">{mensaje}</div>}

      {/* Logo de la empresa */}
      <section className="admin-card">
        <h3>Logo de la empresa</h3>
        <p className="admin-desc">
          Sube una imagen; aparecerá al lado del nombre de tu empresa.
        </p>
        <div className="admin-logo-row">
          {usuario?.empresa_logo ? (
            <img src={usuario.empresa_logo} alt="Logo" className="admin-logo-preview" />
          ) : (
            <div className="admin-logo-vacio">Sin logo</div>
          )}
          <div className="admin-logo-acciones">
            <label className="admin-btn admin-btn-file">
              Subir logo
              <input type="file" accept="image/*" onChange={subirLogo} hidden />
            </label>
            {usuario?.empresa_logo && (
              <button className="admin-btn-mini" onClick={quitarLogo}>
                Quitar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tema / paleta de colores */}
      <section className="admin-card">
        <h3>Color de la empresa</h3>
        <p className="admin-desc">
          Elige una paleta. Cambia el color de toda la app (el login se queda igual).
        </p>
        <div className="admin-temas">
          {TEMAS.map((t) => (
            <button
              key={t.id}
              className={`admin-tema ${usuario?.empresa_tema === t.id ? "activo" : ""}`}
              onClick={() => cambiarTema(t.id)}
            >
              <span className="admin-tema-swatch" style={{ background: t.color }} />
              {t.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Código de empresa */}
      <section className="admin-card">
        <h3>Código de la empresa</h3>
        <p className="admin-desc">
          Comparte este código con tus empleados para que se unan a tu empresa.
        </p>
        <div className="admin-codigo-row">
          <span className="admin-codigo">{usuario?.empresa_codigo}</span>
          <button className="admin-btn" onClick={copiarCodigo}>
            {copiado ? "¡Copiado!" : "Copiar"}
          </button>
          <button className="admin-btn-mini" onClick={regenerarCodigo}>
            Regenerar
          </button>
        </div>
      </section>

      {/* Cambiar nombre */}
      <section className="admin-card">
        <h3>Nombre de la empresa</h3>
        <form className="admin-inline" onSubmit={guardarNombre}>
          <input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            placeholder="Nombre de la empresa"
          />
          <button className="admin-btn" type="submit">
            Guardar
          </button>
        </form>
      </section>

      {/* Empleados */}
      <section className="admin-card">
        <h3>Empleados ({empleados.length})</h3>
        {empleados.length === 0 && <p className="admin-desc">No hay empleados aún.</p>}
        {empleados.map((emp) => (
          <div key={emp.id} className="admin-empleado-bloque">
            <div className="admin-empleado">
              <div className="admin-empleado-info">
                <span className="admin-empleado-nombre">{emp.nombre}</span>
                <span className="admin-empleado-user">@{emp.username}</span>
              </div>
              <div className="admin-empleado-acciones">
                <span className={`admin-rol admin-rol-${emp.rol}`}>{rolLabel(emp.rol)}</span>
                {emp.id !== usuario?.id && (
                  <>
                    {emp.rol === "empleado" ? (
                      <button className="admin-btn-mini" onClick={() => cambiarRol(emp, "admin")}>
                        Hacer empresario
                      </button>
                    ) : (
                      <button className="admin-btn-mini" onClick={() => cambiarRol(emp, "empleado")}>
                        Pasar a empleado
                      </button>
                    )}
                    <button className="admin-btn-quitar" onClick={() => quitarEmpleado(emp)}>
                      Quitar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Zona peligrosa */}
      <section className="admin-card admin-peligro">
        <h3>Eliminar empresa</h3>
        <p className="admin-desc">
          Esto borra de forma permanente la empresa, sus usuarios y todos sus datos
          (clientes, ventas, pagos y gastos). No se puede deshacer.
        </p>
        <button className="admin-btn-peligro" onClick={() => setModalEliminar(true)}>
          Eliminar cuenta de la empresa
        </button>
      </section>

      <Modal
        isOpen={modalEliminar}
        title="Eliminar empresa"
        onConfirm={eliminarEmpresa}
        onCancel={() => setModalEliminar(false)}
      >
        <p>
          ¿Seguro que deseas eliminar <strong>{usuario?.empresa_nombre}</strong> y todos sus
          datos? Esta acción es permanente.
        </p>
      </Modal>
    </div>
  );
}

export default AdminPanel;

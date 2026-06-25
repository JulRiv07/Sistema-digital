import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import "./AdminPanel.css";

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
          <div key={emp.id} className="admin-empleado">
            <div className="admin-empleado-info">
              <span className="admin-empleado-nombre">{emp.nombre}</span>
              <span className="admin-empleado-user">@{emp.username}</span>
            </div>
            <div className="admin-empleado-acciones">
              <span className={`admin-rol admin-rol-${emp.rol}`}>{rolLabel(emp.rol)}</span>
              {emp.id !== usuario?.id &&
                (emp.rol === "empleado" ? (
                  <button className="admin-btn-mini" onClick={() => cambiarRol(emp, "admin")}>
                    Hacer empresario
                  </button>
                ) : (
                  <button className="admin-btn-mini" onClick={() => cambiarRol(emp, "empleado")}>
                    Pasar a empleado
                  </button>
                ))}
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

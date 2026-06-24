import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import "./styles/forms.css";

function Contenido() {
  const { usuario, cargando } = useAuth();
  const [vista, setVista] = useState("login");

  if (cargando) {
    return <div className="auth-loading">Cargando…</div>;
  }

  if (!usuario) {
    return vista === "login" ? (
      <Login irARegistro={() => setVista("registro")} />
    ) : (
      <Registro irALogin={() => setVista("login")} />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <Contenido />
    </AuthProvider>
  );
}

export default App;

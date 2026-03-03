import { useState } from "react";
import ClienteForm from "./ClienteForm";
import ClientesList from "./ClientesList";

function ClientesPanel() {

    const [view, setView] = useState("crear");

    return (
        <div className="form-container">

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button onClick={() => setView("crear")}>
            Crear Cliente
            </button>

            <button onClick={() => setView("listar")}>
            Ver Clientes
            </button>
        </div>

        {view === "crear" && <ClienteForm />}
        {view === "listar" && <ClientesList />}

        </div>
    );
}

export default ClientesPanel;
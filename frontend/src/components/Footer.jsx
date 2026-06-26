import "./Footer.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FRASES } from "../services/frases";

const EMPRESA_PRINCIPAL = "Postres Juli";

function fraseAleatoria(excluir) {
  let f = FRASES[Math.floor(Math.random() * FRASES.length)];
  if (excluir && FRASES.length > 1) {
    while (f === excluir) {
      f = FRASES[Math.floor(Math.random() * FRASES.length)];
    }
  }
  return f;
}

function Footer() {
  const { usuario } = useAuth();

  const empresaNombre = usuario?.empresa_nombre || "Controla";
  const esPrincipal = empresaNombre === EMPRESA_PRINCIPAL;
  const anio = new Date().getFullYear();

  const [frase, setFrase] = useState(() => fraseAleatoria());

  // Cambia la frase cada 25 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setFrase((actual) => fraseAleatoria(actual));
    }, 25000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="footer">
      <p className="footer-frase"> {frase}</p>

      {esPrincipal ? (
        <p className="footer-info">
          © JRS <br />
          {anio} Postres Juli - Sistema de Gestión <br />
          Te amo ma ❤️
        </p>
      ) : (
        <p className="footer-info">
          {empresaNombre} <br />
          {anio} · Powered by Controla
        </p>
      )}
    </footer>
  );
}

export default Footer;

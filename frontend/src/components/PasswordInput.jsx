import { useState } from "react";

function PasswordInput({ value, onChange, placeholder = "••••••••" }) {
  const [ver, setVer] = useState(false);

  return (
    <div className="password-field">
      <input
        type={ver ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVer((v) => !v)}
        aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={ver ? "Ocultar" : "Mostrar"}
      >
        {ver ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

export default PasswordInput;

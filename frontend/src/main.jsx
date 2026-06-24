import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./services/api"; // configura axios.defaults.baseURL al arrancar
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const API_URL = "http://127.0.0.1:8000"; 


export const getResumen = async () => {
  const response = await fetch(`${API_URL}/resumen`);
  return response.json();
};
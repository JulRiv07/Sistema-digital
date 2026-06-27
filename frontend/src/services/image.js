const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

// Lee un archivo de imagen y lo devuelve como data URL (base64),
// redimensionado para que pese poco antes de guardarlo en la base.
export function leerImagenRedimensionada(file, maxLado = 256) {
  return new Promise((resolve, reject) => {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return reject(new Error("Solo se permiten imágenes JPEG, PNG o WebP"));
    }
    if (file.size > MAX_SIZE_BYTES) {
      return reject(new Error("La imagen no puede superar 2 MB"));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          if (width >= height) {
            height = Math.round((height * maxLado) / width);
            width = maxLado;
          } else {
            width = Math.round((width * maxLado) / height);
            height = maxLado;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

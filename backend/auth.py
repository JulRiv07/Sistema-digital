import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Usuario

# Clave secreta para firmar los JWT. En producción se define como variable
# de entorno (SECRET_KEY) en Render. El valor por defecto es solo para
# desarrollo local.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-cambia-esto")
ALGORITHM = "HS256"
TOKEN_EXP_MINUTOS = 60 * 24 * 7  # 7 días

# Extrae el token del header  Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str) -> str:
    """Devuelve el hash bcrypt de una contraseña en texto plano."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Compara una contraseña en texto plano contra su hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def crear_token(usuario: Usuario) -> str:
    """Genera un JWT que identifica al usuario y a su empresa."""
    payload = {
        "sub": str(usuario.id),
        "empresa_id": usuario.empresa_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXP_MINUTOS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Dependencia de FastAPI: valida el token y devuelve el usuario actual."""
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = int(payload.get("sub"))
    except Exception:
        raise error

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise error
    return usuario

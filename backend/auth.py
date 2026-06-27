import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import RefreshToken, Usuario

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY no está configurado. Define la variable de entorno SECRET_KEY."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTOS = 15
REFRESH_TOKEN_DIAS = 7

# Render define RENDER=true automáticamente en producción
COOKIE_SECURE = os.getenv("RENDER") == "true"
COOKIE_SAMESITE: str = "none" if COOKIE_SECURE else "lax"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def crear_access_token(usuario: Usuario) -> str:
    payload = {
        "sub": str(usuario.id),
        "empresa_id": usuario.empresa_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTOS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def crear_refresh_token(usuario: Usuario, db: Session) -> str:
    token_raw = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DIAS)
    db.add(RefreshToken(
        usuario_id=usuario.id,
        token_hash=token_hash,
        expires_at=expires,
    ))
    db.commit()
    return token_raw


def revocar_refresh_token(token_raw: str | None, db: Session) -> None:
    if not token_raw:
        return
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    registro = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash
    ).first()
    if registro:
        registro.revocado = True
        db.commit()


def verificar_refresh_token(token_raw: str | None, db: Session) -> Usuario:
    if not token_raw:
        raise HTTPException(status_code=401, detail="Refresh token requerido")
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    registro = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revocado == False,  # noqa: E712
    ).first()
    if not registro:
        raise HTTPException(status_code=401, detail="Refresh token inválido o revocado")
    expires = registro.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expirado")
    usuario = db.query(Usuario).filter(Usuario.id == registro.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario


def get_usuario_actual(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not access_token:
        raise error
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = int(payload.get("sub"))
    except Exception:
        raise error
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise error
    return usuario

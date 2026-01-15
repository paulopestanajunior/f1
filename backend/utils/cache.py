import json
import pathlib
from typing import Any, Dict, Optional
from threading import Lock

from fastapi.encoders import jsonable_encoder  # ✅

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"
CACHE_DIR.mkdir(exist_ok=True)

_lock = Lock()

def _path(key: str) -> pathlib.Path:
    return CACHE_DIR / f"{key}.json"

def read_cache(key: str) -> Optional[Dict[str, Any]]:
    path = _path(key)
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None

def write_cache(key: str, data: Dict[str, Any]) -> None:
    path = _path(key)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)

def get_or_set_cache(key: str, builder_fn) -> Dict[str, Any]:
    with _lock:
        cached = read_cache(key)
        if cached is not None:
            print(f"[cache] HIT {key}")
            return cached

        print(f"[cache] MISS {key} → criando arquivo")
        data = builder_fn()

        # ✅ transforma Pydantic / datetime / etc em JSON-safe
        data = jsonable_encoder(data)

        write_cache(key, data)
        return data

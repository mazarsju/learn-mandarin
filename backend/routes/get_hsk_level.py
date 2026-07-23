from flask import Blueprint

from backend.hsk_level import get_hsk_level_status

bp = Blueprint("get_hsk_level", __name__)


@bp.get("/hsk-level")
def get_hsk_level():
    return get_hsk_level_status(), 200

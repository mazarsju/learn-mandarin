from flask import Blueprint

from backend.db_export import DB_EXPORT_FILENAME, export_database_to_file

bp = Blueprint("export_database", __name__)


@bp.post("/database/export")
def export_database():
    export_database_to_file()
    return {
        "message": f"Database exported to {DB_EXPORT_FILENAME}",
        "filename": DB_EXPORT_FILENAME,
    }, 200

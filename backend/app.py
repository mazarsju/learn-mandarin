import os

from flask import Flask
from flask_cors import CORS

from backend.database import configure_database, init_db

app = Flask(__name__)
CORS(app)
configure_database(app)
init_db(app)


@app.route("/hello", methods=["POST"])
def hello():
    return "Hello from backend"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, port=port)

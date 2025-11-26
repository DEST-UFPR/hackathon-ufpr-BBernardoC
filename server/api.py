# ...new file...
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
from app import excel_to_json  # importa a função existente

DB_PATH = "users.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)"
    )
    conn.commit()
    conn.close()

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, generate_password_hash(password)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "username already exists"}), 400
    conn.close()
    return jsonify({"ok": True}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    if user and check_password_hash(user["password"], password):
        return jsonify({"ok": True, "username": username}), 200
    return jsonify({"error": "invalid credentials"}), 401

@app.route("/upload", methods=["POST"])
def upload():
    files = request.files.getlist("files")
    saved = []
    parsed = []
    for f in files:
        filename = f.filename
        path = os.path.join(UPLOAD_FOLDER, filename)
        f.save(path)
        saved.append(filename)
        # se for Excel, extraia e retorne JSON usando excel_to_json
        if filename.lower().endswith((".xlsx", ".xls", ".xlsm", ".csv")):
            try:
                parsed_json = excel_to_json(path)
                parsed.append({"file": filename, "json": parsed_json})
            except Exception as e:
                parsed.append({"file": filename, "error": str(e)})
    return jsonify({"saved": saved, "parsed": parsed}), 200

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
# ...new file...
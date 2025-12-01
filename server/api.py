from flask import Flask, request, jsonify, stream_with_context, Response    
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
from import_file import import_data  
import json
from cache_builder import gerar_cache
import tempfile


DB_PATH = "hackathon.db"


app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'aluno')"
    )
    conn.execute('''CREATE TABLE IF NOT EXISTS disciplina_presencial (
ID_PESQUISA VARCHAR(10),
ID_QUESTIONARIO INT,
QUESTIONARIO VARCHAR(256),
ID_PERGUNTA VARCHAR(10),	
PERGUNTA VARCHAR(256),
RESPOSTA VARCHAR(50),	
SITUACAO VARCHAR(30),	
COD_DISCIPLINA VARCHAR(30),	
NOME_DISCIPLINA VARCHAR(256),	
COD_CURSO VARCHAR(30),	
MULTIPLA_ESCOLHA VARCHAR(10),	
CURSO VARCHAR(100),
SETOR_CURSO VARCHAR(50),	
DEPARTAMENTO VARCHAR(50),	
CODPROF VARCHAR(30),
ENTRY_DATE DATETIME DEFAULT CURRENT_TIMESTAMP
)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS disciplina_ead(
                 ID_PESQUISA VARCHAR(10),
ID_QUESTIONARIO INT,
QUESTIONARIO VARCHAR(256),
ID_PERGUNTA VARCHAR(10),	
PERGUNTA VARCHAR(256),
RESPOSTA VARCHAR(50),	
SITUACAO VARCHAR(30),	
COD_DISCIPLINA VARCHAR(30),	
NOME_DISCIPLINA VARCHAR(256),	
COD_CURSO VARCHAR(30),	
MULTIPLA_ESCOLHA VARCHAR(10),	
CURSO VARCHAR(100),
SETOR_CURSO VARCHAR(50),	
DEPARTAMENTO VARCHAR(50),	
CODPROF VARCHAR(30),
ENTRY_DATE DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.execute(''' CREATE TABLE IF NOT EXISTS institucional(
                 ID_PESQUISA VARCHAR(10),
                 ID_QUESTIONARIO INT,
                 QUESTIONARIO VARCHAR(256),
                 ID_PERGUNTA VARCHAR(10),	
                 PERGUNTA VARCHAR(256),
                 RESPOSTA VARCHAR(50),
                 SITUACAO VARCHAR(30),
                 LOTACAO VARCHAR(50),
                 SIGLA_LOTACAO VARCHAR(15),
                 ENTRY_DATE DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.execute(''' CREATE TABLE IF NOT EXISTS cursos(
                 ID_PESQUISA VARCHAR(10),
ID_PERGUNTA VARCHAR(10),	
ID_QUESTIONARIO INT,

QUESTIONARIO VARCHAR(256),
PERGUNTA VARCHAR(256),
RESPOSTA VARCHAR(50),	
SITUACAO VARCHAR(30),	
MULTIPLA_ESCOLHA VARCHAR(10),	
CURSO VARCHAR(100),
COD_CURSO VARCHAR(30),	
SETOR_CURSO VARCHAR(50),	
ENTRY_DATE DATETIME DEFAULT CURRENT_TIMESTAMP                 
                 )''')

    conn.commit()
    conn.close()



@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    role = data.get("role", "aluno").strip().lower()
    
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    
    if role not in ["admin", "professor", "aluno"]:
        return jsonify({"error": "invalid role"}), 400
    
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            (username, generate_password_hash(password), role),
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
        return jsonify({"ok": True, "username": username, "role": user["role"]}), 200
    return jsonify({"error": "invalid credentials"}), 401

@app.route("/import_file", methods=["POST"])
def import_file():
    uploaded_file = request.files.get('file')
    page_type = request.form.get('type')
    sheet = request.form.get('pageName')
    if not uploaded_file:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    
    # Cria arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(uploaded_file.filename)[1]) as tmp_file:
        file_path = tmp_file.name
        uploaded_file.save(file_path)
        
    try:
        import_data(type=page_type, file_path=file_path, sheet_name=sheet)
        gerar_cache()
    finally:
        # Remove o arquivo temporário após processar
        if os.path.exists(file_path):
            os.remove(file_path)
    
    return jsonify({"executado com sucesso": True}), 200


@app.route("/api/atualizar-cache", methods=["POST"])
def atualizar_cache():
    # opcional: verificar se usuário é admin
    data = request.get_json() or {}
    role = data.get("role")  # você define como validar

    if role != "admin":
        return jsonify({"error": "not authorized"}), 403

    gerar_cache()
    return jsonify({"ok": True, "mensagem": "Cache atualizado"}), 200


@app.route("/api/todas-tabelas")
def todas_tabelas():
    tabelas = [
        "disciplina_presencial",
        "disciplina_ead",
        "curso",  # ou cursos, depende da sua base
        "institucional"
    ]

    base_path = "cache"
    resposta = {}

    for nome in tabelas:
        caminho = os.path.join(base_path, f"{nome}.json")

        if os.path.exists(caminho):
            with open(caminho, "r", encoding="utf-8") as f:
                resposta[nome] = json.load(f)
        else:
            resposta[nome] = None

    return jsonify(resposta)



if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)

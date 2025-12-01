# cache_builder.py
import sqlite3
import json
import os
import shutil

DB = "hackathon.db"
CACHE_DIR = "cache"
os.makedirs(CACHE_DIR, exist_ok=True)

TABELAS = [
    "disciplina_presencial",
    "disciplina_ead",
    "cursos",
    "institucional",
]

def gerar_cache():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    for tabela in TABELAS:
        cursor.execute(f"SELECT * FROM {tabela}")
        rows = [dict(r) for r in cursor.fetchall()]

        # Escreve em arquivo temporário
        temp_path = f"{CACHE_DIR}/{tabela}.json.tmp"
        final_path = f"{CACHE_DIR}/{tabela}.json"
        
        with open(temp_path, "w", encoding="utf8") as f:
            json.dump(rows, f, ensure_ascii=False)
        
        # Renomeia atomicamente (evita hot reload no meio da escrita)
        shutil.move(temp_path, final_path)

    conn.close()
    print("[CACHE] Cache atualizado com sucesso!")
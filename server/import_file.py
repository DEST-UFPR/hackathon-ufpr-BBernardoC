import sqlite3
import pandas as pd

def get_connection():
    return sqlite3.connect("hackathon.db")

def import_data(type, file_path, sheet_name):
    # --- sheet case-insensitive ---
    xls = pd.ExcelFile(file_path)
    sheets = {sh.lower(): sh for sh in xls.sheet_names}

    if sheet_name.lower() not in sheets:
        raise ValueError(f"Aba '{sheet_name}' não encontrada (ignorar case).")

    sheet_real = sheets[sheet_name.lower()]

    # Lê o Excel
    df = pd.read_excel(file_path, sheet_name=sheet_real)

    tabela = type

    # --- Inserção otimizada ---
    conn = get_connection()
    try:
        cursor = conn.cursor()

        colunas = df.columns.tolist()
        placeholders = ",".join(["?"] * len(colunas))

        sql = f"""
            INSERT INTO {tabela} ({','.join(colunas)})
            VALUES ({placeholders})
        """

        # Converte para tuplas rapidamente
        dados = [tuple(r) for r in df.itertuples(index=False, name=None)]

        cursor.executemany(sql, dados)
        
        conn.commit()
    finally:
        conn.close()

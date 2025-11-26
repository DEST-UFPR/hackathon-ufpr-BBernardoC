import pandas as pd
import json
import os

def excel_to_json(input_path, output_path=None):
    """
    Lê um arquivo Excel e converte seu conteúdo para JSON.
    
    Parâmetros:
        input_path (str): Caminho do arquivo .xlsx
        output_path (str): Caminho para salvar o JSON (opcional)
    
    Retorna:
        str: JSON em formato string
    """

    # Lê o Excel (padrão: primeira aba)
    df = pd.read_excel(input_path)

    # Converte para JSON (lista de registros)
    json_output = df.to_json(orient="records", force_ascii=False)

    # Se o usuário quiser salvar em arquivo
    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(json_output)

    return json_output


# -----------------------
# Exemplo de uso:
# -----------------------
input_file = "/mnt/data/DadosAvDisciplinasEAD_1S2025.xlsx"
output_file = "/mnt/data/output.json"

def _example():
    json_data = excel_to_json(input_file, output_file)
    print("Conversão concluída!")
    print(f"Arquivo gerado em: {output_file}")

if __name__ == "__main__":
    _example()

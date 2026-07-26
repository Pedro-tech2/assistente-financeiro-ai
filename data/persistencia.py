import json
import os

CAMINHO_ARQUIVO = "data/dados.json"

def salvar_analise(analise: dict) -> None:
    """
    Adiciona uma nova análise financeira ao historico salvo em dados.json.
    """
    historico = []

    if os.path.exists(CAMINHO_ARQUIVO):
        with open(CAMINHO_ARQUIVO, "r", encoding="utf-8") as arquivo:
            historico = json.load(arquivo)

    historico.append(analise)

    with open(CAMINHO_ARQUIVO, "w", encoding="utf-8") as arquivo:
        json.dump(historico, arquivo, indent=4, ensure_ascii=False)

def carregar_historico() -> list:
    """
    Retorna a lista de todas as análises já salvas em dados.json.
    Se o arquivo não existir, retorna uma lista vazia.
    """
    if not os.path.exists(CAMINHO_ARQUIVO):
        return []
    
    with open(CAMINHO_ARQUIVO, "r", encoding="utf-8") as arquivo:
        return json.load(arquivo)
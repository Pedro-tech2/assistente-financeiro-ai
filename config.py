import os
from dotenv import load_dotenv, find_dotenv

# Carrega as variáveis contidas no arquivo .env para a memória do sistema operacional
load_dotenv(find_dotenv())

# Cria variáveis em python que guardam os valores de ambiente de forma simples
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")
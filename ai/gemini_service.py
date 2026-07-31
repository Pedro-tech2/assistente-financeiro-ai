from google import genai
import os

def gerar_conselho_financeiro(prompt_usuario: str) -> str:
    """
    Função que conecta na API do Gemini e retorna uma resposta inteligente para perguntas financeiras abertas
    """
    api_key = os.getenv("GEMINI_API_KEY")

    # Iniciamos o cliente do Gemini com a chave de API
    client = genai.Client(api_key=api_key)

    # Solicitamos uma resposta ao modelo para textos (gemini-3.5-flash) com base no prompt do usuário
    response = client.models.generate_content(
        model='gemini-3.5-flash', 
        contents=prompt_usuario
    )
    
    # Retornamos o texto da resposta
    return response.text
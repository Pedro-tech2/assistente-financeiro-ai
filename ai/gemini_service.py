import os

from google import genai
from google.genai import types


INSTRUCOES_SISTEMA = """
Você é o Assistente Financeiro oficial desta plataforma web. Responda em
português brasileiro, com clareza, cordialidade e responsabilidade.

Conheça e explique as funcionalidades disponíveis no site:
- Análise Financeira: analisa salário, gastos fixos e dívidas e apresenta
  total de gastos, saldo, percentual de gastos e diagnóstico, além de salvar
  o resultado no histórico.
- Projeção Financeira: calcula o tempo para alcançar uma meta, estima uma
  reserva de emergência a partir dos gastos fixos e projeta economia potencial
  a partir do saldo mensal.
- Simulação de Quitação de Dívidas: estima os meses para quitar uma dívida
  com base no valor informado e no pagamento mensal, sem considerar juros.
- Análise de Despesas: resume uma lista de despesas com total, maior, menor
  e média.

Quando o usuário perguntar como usar o site, oriente-o para a funcionalidade
correspondente, sem pedir que acesse links externos. Também responda dúvidas
gerais sobre educação financeira. Não invente resultados de cálculos feitos
pela aplicação; oriente o usuário a usar a ferramenta correspondente. Deixe
claro que informações gerais não substituem aconselhamento financeiro
profissional e não solicite dados pessoais ou credenciais.
""".strip()


def gerar_conselho_financeiro(prompt_usuario: str) -> str:
    """
    Envia a pergunta ao Gemini com a identidade e o escopo do assistente.

    Args:
        prompt_usuario: Pergunta enviada pelo usuário.

    Returns:
        Texto da resposta gerada pelo Gemini.
    """
    api_key = os.getenv("GEMINI_API_KEY")

    # Inicia o cliente do Gemini com a chave de API
    client = genai.Client(api_key=api_key)

    # Solicita uma resposta ao modelo para textos (gemini-3.5-flash) com base no prompt do usuário
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt_usuario,
        config=types.GenerateContentConfig(system_instruction=INSTRUCOES_SISTEMA),
    )
    
    # Retorna o texto da resposta
    return response.text
from unittest.mock import patch

from ai.gemini_service import INSTRUCOES_SISTEMA, gerar_conselho_financeiro


def test_gemini_request_includes_platform_identity_and_financial_tools():
    with patch("ai.gemini_service.genai.Client") as client_factory:
        client = client_factory.return_value
        client.models.generate_content.return_value.text = "Resposta de teste"

        with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
            resposta = gerar_conselho_financeiro("Como calculo minha reserva?")

    request = client.models.generate_content.call_args.kwargs
    assert resposta == "Resposta de teste"
    assert request["contents"] == "Como calculo minha reserva?"
    assert request["config"].system_instruction == INSTRUCOES_SISTEMA
    assert "Assistente Financeiro oficial" in INSTRUCOES_SISTEMA
    assert "Análise Financeira" in INSTRUCOES_SISTEMA
    assert "Projeção Financeira" in INSTRUCOES_SISTEMA
    assert "Simulação de Quitação de Dívidas" in INSTRUCOES_SISTEMA
    assert "Análise de Despesas" in INSTRUCOES_SISTEMA
    assert "sem pedir" in INSTRUCOES_SISTEMA

import config 
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ai.gemini_service import gerar_conselho_financeiro
from core.financeiro import analisar_financas
from core.calculos import calcular_reserva_emergencia, calcular_meses_para_meta, calcular_economia_potencial, simular_quitacao_divida, analisar_despesas
from data.persistencia import salvar_analise, carregar_historico

app = FastAPI()

class PerguntaRequest(BaseModel):
    """
    Representa o formato de uma requisição, não uma regra de negócio.
    """
    pergunta: str
    
class AnaliseRequest(BaseModel):
    salario: float
    gastos_fixos: float
    dividas: float

class ReservaRequest(BaseModel):
    gastos_fixos: float

class MetaRequest(BaseModel):
    meta: float
    economia_mensal: float

class QuitacaoRequest(BaseModel):
    dividas: float
    pagamento_mensal: float

class EconomiaRequest(BaseModel):
    saldo: float

class DespesasRequest(BaseModel):
    despesas: list[float]    

@app.post("/chat")
def chat(request: PerguntaRequest):
    """
    Endpoint que recebe uma pergunta do usuário e retorna uma resposta gerada pelo modelo Gemini
    """
    try:
        resposta = gerar_conselho_financeiro(request.pergunta)
        return {"resposta": resposta}
    except Exception as erro:
        raise HTTPException(status_code=502, detail="Não foi possível obter resposta da IA no momento. Tente novamente mais tarde.")

@app.post("/reserva-emergencia")
def reserva_emergencia(request: ReservaRequest):
    """
    Endpoint que calcula a reserva de emergencia recomendada (6x os gastos fixos).
    """
    try:
        reserva = calcular_reserva_emergencia(request.gastos_fixos)
        return {"reserva_recomendada": reserva}
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))

@app.post("/meta")
def meta(request: MetaRequest):
    """
    Endpoint que calcula em quantos meses uma meta financeira será atingida.
    """
    try:
        meses = calcular_meses_para_meta(request.meta, request.economia_mensal)
        return {"meses_para_atingir_meta": meses}
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))
    
@app.post("/quitacao-divida")
def quitacao_divida(request: QuitacaoRequest):
    """
    Endpoint que simula em quantos meses uma dívida poderá ser paga.
    """
    try:
        resultado = simular_quitacao_divida(request.dividas, request.pagamento_mensal)
        return resultado
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))

    
@app.post("/economia-potencial")
def economia_potencial(request: EconomiaRequest):
    """
    Endpoint que calcula a economia potencial em um período de um, dois e cinco anos.
    """
    try:
        projecao = calcular_economia_potencial(request.saldo)
        return projecao
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))
    
@app.post("/analise-despesas")
def analise_despesas(request: DespesasRequest):
    """
    Endpoint que recebe os dados das despesas.
    """
    try:
        resultado = analisar_despesas(request.despesas)
        return resultado
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro))

@app.post("/analise")
def analise(request: AnaliseRequest):
    """
    Endpoint que recebe os dados financeiros, retorna a análise completa e salva o resultado do histórico.
    """
    resultado = analisar_financas(
        salario=request.salario,
        gastos_fixos=request.gastos_fixos,
        dividas=request.dividas
    )
    salvar_analise(resultado)
    return resultado

@app.get("/historico")
def historico():
    """
    Endpoint que retorna todas as análises já salvas.
    """
    return carregar_historico()

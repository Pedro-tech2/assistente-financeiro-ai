from core.calculos import calcular_total_gastos, calcular_saldo, calcular_porcentagem_gastos

def mostrar_diagnostico(saldo: float, percentual: float) -> str:
    """
    Gera um diagnóstico financeiro com base no saldo e percentual de gastos.
    """
    if saldo < 0:
        return "Orçamento no vermelho. Sugestão: reduzir gastos e priorizar pagamento de dividas"
    elif percentual > 80:
        return "ATENÇÃO: Você está gastando mais de 80% da renda. Sugestão: criar umma reserva de emergência"
    elif percentual > 50:
        return "Situação moderada. Sugestão: acompanhar gastos mensalmente"
    else: 
        return "Excelente controle financeiro."
    
def analisar_financas(salario: float, gastos_fixos: float, dividas: float) -> dict:
    """
    Orquestra o cálculo financeiro completo: total de gastos, saldo e percentual gasto e diagnóstico, retornando tudo em um dicionário.
    """
    total_gastos = calcular_total_gastos(gastos_fixos, dividas)
    saldo = calcular_saldo(salario, total_gastos)
    percentual = round (calcular_porcentagem_gastos(salario, total_gastos), 2)
    diagnostico = mostrar_diagnostico(saldo, percentual)

    return {
        "total_gastos": total_gastos,
        "saldo": saldo,
        "percentual_gastos": percentual,
        "diagnostico": diagnostico
    }
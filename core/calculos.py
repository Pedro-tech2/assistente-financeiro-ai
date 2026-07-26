def calcular_total_gastos(gastos_fixos: float, dividas: float) -> float:
    return gastos_fixos + dividas

def calcular_saldo(salario: float, total_gastos: float) -> float:
    return salario - total_gastos

def calcular_porcentagem_gastos(salario: float, total_gastos: float) -> float:
    if salario == 0:
        return 0.0
    return (total_gastos / salario) * 100

def calcular_reserva_emergencia(gastos_fixos: float) -> float:
    if gastos_fixos < 0:
        raise ValueError("Gastos fixos não podem ser negativos.")
    return gastos_fixos * 6

def calcular_meses_para_meta(meta: float, economia_mensal: float) -> int:
    if meta <= 0 or economia_mensal <= 0:
        raise ValueError("Meta e economia mensal devem ser maiores que zero.")
    
    meta_restante = meta
    meses = 0

    while meta_restante > 0:
        meta_restante -= economia_mensal
        meses += 1
    
    return meses

def calcular_economia_potencial(saldo: float) -> dict:
    if saldo <= 0:
        raise ValueError("O saldo precisa ser maior que zero.")
    
    return{
        "um_ano": round(saldo * 12, 2),
        "dois_anos": round(saldo * 24, 2),
        "cinco_anos": round(saldo * 60, 2)
    }

def simular_quitacao_divida(dividas: float, pagamento_mensal: float) ->dict:
    if pagamento_mensal <= 0 or dividas <= 0:
        raise ValueError("Pagamento mensal ou dívida precisa ser maior que zero")
    
    divida_restante = dividas
    meses = 0
    historico_mensal = []

    while divida_restante > 0:
        divida_restante -= pagamento_mensal
        meses += 1

        if divida_restante < 0:
            divida_restante = 0

        historico_mensal.append({
            "mes": meses,
            "divida_restante": round(divida_restante, 2)
        })
    
    return {
        "meses_para_quitar": meses,
        "historico": historico_mensal
    }

def analisar_despesas(despesas: list[float]) ->dict:
    if not despesas:
        raise ValueError("A lista de despesas não pode estar vazia.")
    for despesa in despesas:
        if despesas <= 0:
            raise ValueError("Todas as despesas devem ser maiores que zero")
    
    total = sum(despesas)
    maior = max(despesas)
    menor = min(despesas)
    media = round(total / len(despesas), 2)

    return {
        "total": round(total, 2),
        "maior": maior,
        "menor": menor,
        "media": media
    }
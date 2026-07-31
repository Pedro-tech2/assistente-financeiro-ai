import pytest
from core.calculos import calcular_meses_para_meta, calcular_total_gastos, calcular_saldo, calcular_porcentagem_gastos, calcular_reserva_emergencia, calcular_economia_potencial, simular_quitacao_divida, analisar_despesas

@pytest.mark.parametrize("gastos_fixos, dividas, esperado", [
    (1200, 500, 1700), 
    (0, 0, 0),
    (1000, 0, 1000)
])
def test_calcular_total_gastos_varios_casos(gastos_fixos, dividas, esperado):
    resultado = calcular_total_gastos(gastos_fixos, dividas)
    assert resultado == esperado

@pytest.mark.parametrize("gastos_fixos, dividas", [
    (1200, -500), 
    (-300, 0),
    (-4, -7)
])
def test_gastos_fixos_varios_casos_invalidos(gastos_fixos, dividas):
    with pytest.raises(ValueError):
        calcular_total_gastos(gastos_fixos, dividas)

@pytest.mark.parametrize("meta, economia_mensal, meses_esperado", [
    (2000, 200, 10)])
def  test_calcular_meses_para_meta_casos_validos(meta, economia_mensal, meses_esperado):
    resultado = calcular_meses_para_meta(meta, economia_mensal)
    assert resultado == meses_esperado

@pytest.mark.parametrize("meta, economia_mensal", [
    (0, 20),
    (-40, 0)
])
def test_calcular_meses_para_meta_casos_invalidos(meta, economia_mensal):
    with pytest.raises(ValueError):
        calcular_meses_para_meta(meta, economia_mensal)

@pytest.mark.parametrize("salario, total_gastos, saldo_esperado", [
    (1500, 1000, 500),
    (500, 1000, -500),
    (2000, 0, 2000)
    ])
def test_calcular_saldo_casos_validos(salario, total_gastos, saldo_esperado):
    resultado = calcular_saldo(salario, total_gastos)
    assert resultado == saldo_esperado

@pytest.mark.parametrize("salario, total_gastos",[
    (0, 1000),
    (-1000, 500),
    (3000, -50)
    ])
def test_calcular_saldo_casos_invalidos(salario, total_gastos):
    with pytest.raises (ValueError):
        calcular_saldo(salario, total_gastos) 

@pytest.mark.parametrize("salario, total_gastos, percentual_esperado", [
    (1, 10, 1000),
    (5000, 2500, 50),
    (1000, 0, 0)
])
def test_calcular_percentual_valido(salario, total_gastos, percentual_esperado):
    resultado = calcular_porcentagem_gastos(salario, total_gastos)
    assert resultado == percentual_esperado

@pytest.mark.parametrize("gastos_fixos, esperado", [
    (100, 600),
    (0, 0)
])
def test_calcular_reserva_emergencia_dados_validos(gastos_fixos, esperado):
    resultado = calcular_reserva_emergencia(gastos_fixos)
    assert resultado == esperado

@pytest.mark.parametrize("gastos_fixos", [
    -3,
])
def test_calcular_reserva_emergencia_dados_invalidos(gastos_fixos):
    with pytest.raises(ValueError):
        calcular_reserva_emergencia(gastos_fixos)

@pytest.mark.parametrize("saldo, um_ano, dois_anos, cinco_anos", [
    (2, 24, 48, 120)
])
def test_calcular_economia_potencial_validos(saldo, um_ano, dois_anos, cinco_anos):
    resultado = calcular_economia_potencial(saldo)
    esperado = {
        "um_ano": um_ano,
        "dois_anos": dois_anos,
        "cinco_anos": cinco_anos
    }
    assert resultado == esperado

@pytest.mark.parametrize("saldo", [0, -1])
def test_calcular_economia_potencial_invalidos(saldo):
    with pytest.raises(ValueError):
        calcular_economia_potencial(saldo)

@pytest.mark.parametrize("dividas, pagamento_mensal, meses_esperado", [
    (10, 2, 5),
    (8, 20, 1)
])
def test_simular_quitacao_divida_validos(dividas, pagamento_mensal, meses_esperado):
    resultado = simular_quitacao_divida(dividas, pagamento_mensal)
    assert resultado["meses_para_quitar"] == meses_esperado
    assert "historico" in resultado

@pytest.mark.parametrize("dividas, pagamento_mensal", [
    (-300, 10),
    (300, -10),
    (-10, -300)
])
def test_simular_quitacao_divida_invalidos(dividas, pagamento_mensal):
    with pytest.raises(ValueError):
        simular_quitacao_divida(dividas, pagamento_mensal)

@pytest.mark.parametrize("despesas, esperado", [
    ([100, 200, 300], {"total": 600, "maior": 300, "menor": 100, "media": 200.0}),
    ([10.5, 20.5], {"total": 31.0, "maior": 20.5, "menor": 10.5, "media": 15.5})
])
def test_analisar_despesas_validos(despesas, esperado):
    resultado = analisar_despesas(despesas)
    assert resultado == esperado

@pytest.mark.parametrize("despesas", [
    [],
    [0, 100],
    [100, -50]
])
def test_analisar_despesas_invalidos(despesas):
    with pytest.raises(ValueError):
        analisar_despesas(despesas)


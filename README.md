# Assistente Financeiro

Aplicação web educacional para ajudar a organizar informações básicas de
finanças pessoais. Reúne análises e ferramentas de planejamento em uma
interface simples, com cálculos feitos pela API e um chat de educação
financeira com IA. Os resultados são estimativas e não substituem orientação
financeira profissional.

## Da ideia original à aplicação web

O projeto começou como um programa de console em C, desenvolvido no primeiro
período de ADS. Ao longo de oito versões, evoluiu de cálculos básicos para uma
aplicação com menu, funções, structs e persistência em arquivo.

No segundo período, a ideia foi migrada para Python e transformada em uma
aplicação web: FastAPI recebe e valida as entradas, o frontend apresenta os
formulários e resultados, e o Gemini responde a perguntas gerais de educação
financeira. A evolução também serviu para praticar testes automatizados,
integração entre frontend e backend e organização de código.

## Funcionalidades

- **Análise financeira:** calcula total de gastos, saldo e percentual de
  gastos, apresenta um diagnóstico e registra o resultado no histórico.
- **Projeção financeira:** estima o tempo para alcançar uma meta, recomenda
  uma reserva equivalente a seis vezes os gastos fixos informados e projeta
  economia potencial para 1, 2 e 5 anos.
- **Quitação de dívidas:** estima o número de meses e apresenta a evolução
  mensal do saldo da dívida, sem considerar juros.
- **Análise de despesas:** informa total, maior valor, menor valor e média de
  uma lista de despesas.
- **Chat com IA:** responde perguntas gerais e orienta o usuário sobre as
  ferramentas disponíveis no próprio site.
- **Páginas informativas:** reúne perguntas frequentes e a apresentação do
  projeto.

As estimativas dependem dos valores informados e não incluem automaticamente
juros, inflação, rendimento ou mudanças futuras nas finanças.

## Tecnologias

- Python, FastAPI, Pydantic e Uvicorn para a API.
- HTML, CSS e JavaScript para a interface, servida pelo próprio FastAPI.
- Google GenAI SDK para integrar o chat com o Gemini.
- JSON para armazenar localmente o histórico atual.
- Pytest para os testes automatizados.

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| `POST` | `/chat` | Responde a uma pergunta financeira geral |
| `POST` | `/analise` | Calcula e salva uma análise financeira |
| `GET` | `/historico` | Lista as análises salvas |
| `POST` | `/meta` | Calcula os meses para atingir uma meta |
| `POST` | `/reserva-emergencia` | Calcula a reserva recomendada |
| `POST` | `/economia-potencial` | Projeta a economia em 1, 2 e 5 anos |
| `POST` | `/quitacao-divida` | Simula a quitação mês a mês |
| `POST` | `/analise-despesas` | Resume uma lista de despesas |
| `GET` | `/perguntas` | Abre as perguntas frequentes |
| `GET` | `/sobre` | Apresenta o contexto do projeto |

## Executar localmente

Pré-requisitos: Python 3 e uma chave da API Gemini para usar o chat.

1. Clone o repositório e entre na pasta do projeto.
2. Crie e ative o ambiente virtual:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Instale as dependências:

   ```powershell
   pip install -r requirements.txt
   ```

4. Crie um arquivo `.env` na raiz com sua chave:

   ```text
   GEMINI_API_KEY=sua_chave_aqui
   ```

5. Inicie a aplicação:

   ```powershell
   uvicorn main:app --reload
   ```

6. Abra `http://127.0.0.1:8000/` para a interface ou
   `http://127.0.0.1:8000/docs` para a documentação interativa da API.

O FastAPI serve os arquivos de `frontend/` na mesma origem da API. O JavaScript
usa `window.location.origin`; por isso, abra a interface pelo endereço do
Uvicorn, não pelo Live Server. A chave Gemini fica somente no backend e não
deve ser enviada ao frontend.

Para executar os testes:

```powershell
.\venv\Scripts\python.exe -m pytest -q
```

## Deploy no Render e persistência

Configure o serviço web para instalar as dependências com
`pip install -r requirements.txt` e iniciar com
`uvicorn main:app --host 0.0.0.0 --port $PORT`. Cadastre `GEMINI_API_KEY` como
variável de ambiente do serviço; não a inclua no repositório.

O plano gratuito do Render pode suspender serviços sem tráfego e usa sistema de
arquivos efêmero. Como o histórico atual é salvo em `data/dados.json`, ele pode
ser perdido em reinicializações ou novos deploys. Antes de depender de
histórico persistente em produção, migre-o para um banco de dados durável.
Confira as [limitações do plano gratuito](https://render.com/docs/free) e a
documentação de [discos persistentes](https://render.com/docs/disks).

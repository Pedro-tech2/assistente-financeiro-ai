# Assistente Financeiro (versão Python + IA)

API feita em Python para organizar finanças pessoais: calcula saldo, gastos, metas e dívidas, e também responde perguntas abertas sobre finanças usando a IA do Google Gemini.

## De onde veio esse projeto

Esse projeto começou como um programa de console em C, feito no primeiro período de ADS, e foi passando por 8 versões: começou simples (só entrada de dados e cálculo de saldo) e foi ganhando menu, funções separadas, structs e persistência em arquivo.

Agora, no segundo período, decidi migrar a mesma ideia para Python, usando FastAPI para transformar aquele programa de console em uma API de verdade, que pode ser acessada por qualquer aplicativo ou site. Também aproveitei para adicionar uma funcionalidade que o projeto em C não tinha: respostas geradas por IA para perguntas financeiras mais abertas.

## O que a API faz

- Responde perguntas financeiras abertas usando o Gemini
- Calcula saldo, total de gastos, percentual gasto e dá um diagnóstico automático
- Salva cada análise feita em um histórico e permite consultar depois
- Calcula reserva de emergência recomendada
- Calcula quantos meses faltam para atingir uma meta financeira
- Projeta quanto o saldo renderia em 1, 2 e 5 anos, se guardado
- Simula a quitação de uma dívida, mês a mês
- Analisa uma lista de despesas (total, maior, menor, média)

## Tecnologias

- Python 3
- FastAPI (framework da API)
- Uvicorn (roda o servidor)
- Pydantic (valida os dados que chegam na API)
- google-genai (biblioteca oficial do Google para usar o Gemini)
- python-dotenv (carrega a chave de API de forma segura, sem deixar exposta no código)

## Estrutura de pastas

```
assistente-financeiro-ai/
│
├── main.py                # rotas da API
├── config.py               # carrega as variáveis do .env
├── requirements.txt
├── .env                     # chave da API (não vai pro GitHub)
├── .gitignore
│
├── ai/
│   └── gemini_service.py   # conecta com a API do Gemini
│
├── core/
│   ├── calculos.py         # funções de cálculo (saldo, meta, dívida, etc)
│   └── financeiro.py       # junta os cálculos e monta a análise completa
│
└── data/
    ├── persistencia.py     # salva e carrega o histórico
    └── dados.json          # histórico salvo
```

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| POST | `/chat` | Pergunta aberta pra IA sobre finanças |
| POST | `/analise` | Faz a análise financeira completa e salva no histórico |
| POST | `/economia-potencial` | Projeta o saldo em 1, 2 e 5 anos |
| POST | `/quitacao-divida` | Simula o pagamento de uma dívida mês a mês |
| POST | `/reserva-emergencia` | Calcula a reserva de emergência |
| POST | `/meta` | Calcula em quantos meses uma meta é atingida |
| POST | `/analise-despesas` | Analisa uma lista de despesas |
| GET  | `/historico` | Mostra as análises já salvas |

## Como rodar na sua máquina

1. Clone o repositório
2. Crie e ative o ambiente virtual:
   ```
   python -m venv venv
   venv\Scripts\Activate.ps1
   ```
3. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```
4. Crie um arquivo `.env` com sua chave do Gemini:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```
5. Rode o servidor:
   ```
   uvicorn main:app --reload
   ```
6. Abra a documentação automática no navegador:
   ```
   http://127.0.0.1:8000/docs
   ```

Por enquanto o projeto roda só localmente. A interface em `frontend/` pode ser
aberta pelo Live Server do VS Code na porta 5500; a API deve estar rodando na
porta 8000. O arquivo `frontend/js/app.js` centraliza a URL da API na constante
`API_URL`, atualmente configurada para `http://127.0.0.1:8000`.

O backend permite chamadas CORS das origens locais `http://127.0.0.1:5500` e
`http://localhost:5500`. A interface mostra estados de carregamento e mensagens
de erro enquanto aguarda a API. A chave do Gemini permanece no `.env` do
backend e nunca deve ser colocada no JavaScript.

## Considerações para deploy gratuito no Render

De acordo com a [documentação oficial do Render para serviços gratuitos](https://render.com/docs/free),
um serviço web gratuito suspende a instância após 15 minutos sem tráfego; a
reativação na próxima chamada costuma levar cerca de um minuto. O sistema de
arquivos desses serviços é efêmero: alterações locais são perdidas ao suspender,
reiniciar ou redeployar. Serviços web gratuitos não aceitam discos persistentes,
portanto o histórico atual em `data/dados.json` não é armazenamento durável para
deploy.

Antes de publicar com persistência, substitua o JSON por um banco de dados
adequado. A opção gratuita de Postgres do Render também tem limitações e expira
após 30 dias, conforme a mesma [documentação de planos gratuitos](https://render.com/docs/free#30-day-limit).
Consulte também a documentação de [discos persistentes](https://render.com/docs/disks).

## O que aprendi fazendo esse projeto

- Traduzir conceitos de C pra Python: struct virou dicionário, array de tamanho fixo virou lista dinâmica, `scanf` virou validação automática com Pydantic
- Tratar erros com `try/except`, diferenciando erro de quem usa a API (400) de erro de serviço externo, tipo a IA fora do ar (502)
- Salvar dados em JSON com acentuação correta (UTF-8)
- Lidar com uma API externa que muda com o tempo — em um teste real, o modelo do Gemini que eu estava usando foi descontinuado no meio do desenvolvimento, e precisei atualizar o código

## Próximos passos

- Deploy gratuito no Render
- Substituir o histórico em JSON por armazenamento persistente
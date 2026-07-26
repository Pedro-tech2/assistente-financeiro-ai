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
| POST | `/reserva-emergencia` | Calcula a reserva de emergência |
| POST | `/meta` | Calcula em quantos meses uma meta é atingida |
| POST | `/quitacao-divida` | Simula o pagamento de uma dívida mês a mês |
| POST | `/economia-potencial` | Projeta o saldo em 1, 2 e 5 anos |
| POST | `/analise-despesas` | Analisa uma lista de despesas |
| POST | `/analise` | Faz a análise financeira completa e salva no histórico |
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

Por enquanto o projeto roda só localmente. Colocar no ar (deploy no Render) é o próximo passo.

## O que aprendi fazendo esse projeto

- Traduzir conceitos de C pra Python: struct virou dicionário, array de tamanho fixo virou lista dinâmica, `scanf` virou validação automática com Pydantic
- Tratar erros com `try/except`, diferenciando erro de quem usa a API (400) de erro de serviço externo, tipo a IA fora do ar (502)
- Salvar dados em JSON com acentuação correta (UTF-8)
- Lidar com uma API externa que muda com o tempo — em um teste real, o modelo do Gemini que eu estava usando foi descontinuado no meio do desenvolvimento, e precisei atualizar o código

## Próximos passos

- Deploy gratuito no Render
- Testes automatizados com pytest
- Front-end simples para consumir a API
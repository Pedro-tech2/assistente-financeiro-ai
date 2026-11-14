# Guia do frontend

## Visão geral

O frontend apresenta as atividades de análise e planejamento financeiro em cinco
páginas HTML. O arquivo `frontend/js/app.js` conecta os formulários e o chat à
API local e carrega o histórico na página de análise.

## Acessibilidade e apresentação

- Todo campo de entrada deve ter um `<label>` associado.
- Cada página deve manter uma hierarquia coerente de títulos.
- Links devem descrever seu destino, inclusive quando usados por leitores de tela.
- Imagens informativas devem ter texto alternativo.
- Resultados e mensagens devem usar regiões acessíveis quando forem preenchidos.
- O layout do cabeçalho é horizontal em telas largas e empilhado em telas estreitas.
- O chat aparece em todas as páginas. Em telas pequenas, fica no fluxo normal da
  página para não cobrir o conteúdo.

## Funcionalidades e contrato da API

| Rota | Dados enviados | Apresentação prevista | Erro previsto |
|---|---|---|---|
| `POST /analise` | Salário, gastos fixos e dívidas | Diagnóstico e total de gastos, saldo e percentual | Salário inválido |
| `GET /historico` | Nenhum | Tabela com as análises salvas ou aviso de histórico vazio | Erro ao carregar |
| `POST /reserva-emergencia` | Gastos fixos | Valor recomendado para a reserva | Gastos fixos inválidos |
| `POST /meta` | Meta e economia mensal | Meses necessários para atingir a meta | Meta ou economia inválida |
| `POST /quitacao-divida` | Dívida e pagamento mensal | Resultado mês a mês | Dívida ou pagamento inválido |
| `POST /economia-potencial` | Saldo mensal | Projeções para 1, 2 e 5 anos | Saldo menor ou igual a zero |
| `POST /analise-despesas` | Lista de despesas | Total, maior, menor e média | Lista vazia ou despesa inválida |
| `POST /chat` | Pergunta | Resposta do assistente | Serviço indisponível |

## Estrutura de arquivos

| Arquivo | Conteúdo |
|---|---|
| `frontend/index.html` | Página inicial e acesso às atividades |
| `frontend/analise.html` | Formulário de análise financeira e histórico |
| `frontend/projecao.html` | Meta, reserva de emergência e economia potencial |
| `frontend/quitacao.html` | Simulação de quitação de dívidas |
| `frontend/despesas.html` | Análise de despesas |
| `frontend/css/estilo.css` | Estilos compartilhados |
| `frontend/js/app.js` | Integração dos formulários, resultados, histórico e chat |

## Conteúdo atual das páginas

### Página inicial (`index.html`)

- Cabeçalho com título à esquerda e links à direita em telas largas.
- Cards com links descritivos para as quatro atividades.
- Chat conectado ao endpoint `/chat`, com estados de envio e erro.

### Análise financeira (`analise.html`)

- Formulário de salário, gastos fixos e dívidas.
- Área acessível para o diagnóstico e região para erros.
- Seção de histórico com colunas de total de gastos, saldo, percentual e
  diagnóstico, além da mensagem inicial “Nenhuma análise salva ainda.”
- O histórico é carregado pelo endpoint `GET /historico`.

### Projeção financeira (`projecao.html`)

- Meta financeira e reserva de emergência em cards de atividade com formulário.
- Economia potencial em um terceiro card de atividade, com campo próprio para
  saldo mensal, região para erros e cards para 1, 2 e 5 anos.

### Quitação de dívidas (`quitacao.html`)

- Formulário com valor da dívida e pagamento mensal.
- Tabela com a dívida restante em cada mês e região para mensagens de erro.

### Análise de despesas (`despesas.html`)

- Formulário atual com cinco campos fixos de despesa.
- Os cinco campos são convertidos em uma lista para o endpoint
  `POST /analise-despesas`.

## Integração e erros

- A constante `API_URL`, no início de `frontend/js/app.js`, aponta para
  `http://127.0.0.1:8000`.
- As chamadas usam `fetch`, JSON, `response.ok` e tratam falhas de conexão e
  respostas HTTP, inclusive erros 400, 422 e 502.
- Os resultados são inseridos com `textContent` e elementos DOM, sem inserir
  conteúdo da API como HTML.
- Os formulários e o carregamento do histórico mostram estados de espera.
- A chave do Gemini permanece no backend.

## Deploy e persistência

A API ainda está documentada como local. Para deploy, atualize `API_URL` e as
origens CORS conforme os endereços publicados. Um serviço web gratuito do
Render pode dormir após 15 minutos sem tráfego e leva cerca de um minuto para
reativar. Seu sistema de arquivos é efêmero, e o plano gratuito não oferece
disco persistente; portanto, o histórico em `data/dados.json` precisa ser
substituído por armazenamento durável antes de depender dele em produção.

Consulte as limitações atuais na [documentação do Render sobre o plano gratuito](https://render.com/docs/free)
e sobre [discos persistentes](https://render.com/docs/disks).

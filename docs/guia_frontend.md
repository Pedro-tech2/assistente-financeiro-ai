# Guia do frontend

## Visão geral

O frontend apresenta as atividades de análise e planejamento financeiro em
cinco páginas HTML, além das páginas informativas de perguntas frequentes e
sobre o projeto. O arquivo `frontend/js/app.js` conecta os formulários e o chat
à API e carrega o histórico na página de análise. O FastAPI serve os arquivos
do frontend na mesma origem da API.

## Acessibilidade e apresentação

- Todo campo de entrada deve ter um `<label>` associado.
- Cada página deve manter uma hierarquia coerente de títulos.
- Links devem descrever seu destino, inclusive quando usados por leitores de tela.
- Imagens informativas devem ter texto alternativo.
- Resultados e mensagens devem usar regiões acessíveis quando forem preenchidos.
- O layout do cabeçalho é horizontal em telas largas e empilhado em telas estreitas.
- O chat aparece nas páginas das atividades. Em telas pequenas, fica no fluxo
  normal da página para não cobrir o conteúdo.
- A página inicial exibe quatro cards em duas colunas; em smartphones, os cards
  ficam em uma coluna.
- As páginas Perguntas e Sobre estão disponíveis em `/perguntas` e `/sobre`.

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
| `frontend/perguntas.html` | Respostas às perguntas frequentes |
| `frontend/sobre.html` | Contexto e objetivo do projeto |
| `frontend/css/estilo.css` | Estilos compartilhados |
| `frontend/js/app.js` | Integração dos formulários, resultados, histórico e chat |

## Conteúdo atual das páginas

### Página inicial (`index.html`)

- Cabeçalho com título à esquerda e links à direita em telas largas.
- Cards em duas colunas com links descritivos para as quatro atividades e uma
  coluna em telas de até 600px.
- Chat conectado ao endpoint `/chat`, com estados de envio e erro.
- No início, o chat acumula mensagens em balões distintos durante a conversa
  aberta e rola até a mensagem mais recente.
- O backend instrui o Gemini a orientar sobre as ferramentas do site e educação
  financeira geral, sem solicitar links externos.

### Perguntas frequentes (`perguntas.html`) e Sobre (`sobre.html`)

- Páginas informativas acessíveis pelas rotas `/perguntas` e `/sobre`.
- Perguntas em elementos expansíveis acessíveis por teclado.
- A apresentação explica a origem do projeto, suas funcionalidades e seu
  caráter educacional, sem tratar as estimativas como aconselhamento profissional.

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

- A constante `API_URL`, no início de `frontend/js/app.js`, usa
  `window.location.origin`; o frontend é servido pelo próprio FastAPI.
- As chamadas usam `fetch`, JSON, `response.ok` e tratam falhas de conexão e
  respostas HTTP, inclusive erros 400, 422 e 502.
- Os resultados são inseridos com `textContent` e elementos DOM, sem inserir
  conteúdo da API como HTML.
- Os formulários e o carregamento do histórico mostram estados de espera.
- A chave do Gemini permanece no backend.

## Deploy e persistência

A aplicação pode ser testada localmente abrindo `http://127.0.0.1:8000/` após
iniciar o Uvicorn. Um serviço web gratuito do Render pode dormir após 15 minutos
sem tráfego e levar cerca de um minuto para
reativar. Seu sistema de arquivos é efêmero, e o plano gratuito não oferece
disco persistente; portanto, o histórico em `data/dados.json` precisa ser
substituído por armazenamento durável antes de depender dele em produção.

Consulte as limitações atuais na [documentação do Render sobre o plano gratuito](https://render.com/docs/free)
e sobre [discos persistentes](https://render.com/docs/disks).

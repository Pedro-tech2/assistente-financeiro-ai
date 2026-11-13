# Guia do frontend

## Visão geral

O frontend apresenta as atividades de análise e planejamento financeiro em cinco
páginas HTML. Nesta etapa, os formulários, resultados, histórico e chat são
estruturas visuais; a integração com a API e o comportamento dinâmico serão
implementados posteriormente.

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

## Conteúdo atual das páginas

### Página inicial (`index.html`)

- Cabeçalho com título à esquerda e links à direita em telas largas.
- Cards com links descritivos para as quatro atividades.
- Chat estático com a mensagem “Em breve: o assistente responderá aqui.”

### Análise financeira (`analise.html`)

- Formulário de salário, gastos fixos e dívidas.
- Área acessível para o diagnóstico e região para erros.
- Seção de histórico com colunas de total de gastos, saldo, percentual e
  diagnóstico, além da mensagem inicial “Nenhuma análise salva ainda.”
- A consulta ao histórico ainda depende da integração com a API.

### Projeção financeira (`projecao.html`)

- Meta financeira e reserva de emergência em cards de atividade com formulário.
- Economia potencial em um terceiro card de atividade, com campo próprio para
  saldo mensal, região para erros e cards para 1, 2 e 5 anos.

### Quitação de dívidas (`quitacao.html`)

- Formulário com valor da dívida e pagamento mensal.
- Área para resultado e região para mensagens de erro.

### Análise de despesas (`despesas.html`)

- Formulário atual com cinco campos fixos de despesa.
- A rota da API recebe uma lista; a adaptação dos campos para esse formato e a
  inclusão dinâmica de despesas ficam para a integração posterior.

## Etapas futuras

Conectar os formulários às rotas da API, preencher os resultados, carregar o
histórico e implementar o chat. Até lá, os elementos correspondentes são apenas
estrutura visual, sem comportamento dinâmico.

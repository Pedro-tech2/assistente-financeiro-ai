const API_URL = window.location.origin;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const percentFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
});

/**
 * Obtém um elemento obrigatório da página.
 * @param {string} id Identificador HTML do elemento.
 * @returns {HTMLElement} Elemento encontrado.
 * @throws {Error} Quando o elemento não existe.
 */
function obterElemento(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Elemento necessário não encontrado: ${id}`);
    }
    return element;
}

/**
 * Lê um campo numérico do formulário e valida seu valor.
 * @param {HTMLFormElement} form Formulário de origem.
 * @param {string} name Nome do campo.
 * @returns {number} Valor informado.
 * @throws {Error} Quando o campo ou valor é inválido.
 */
function lerNumero(form, name) {
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement) || !Number.isFinite(field.valueAsNumber)) {
        throw new Error("Confira os valores numéricos informados.");
    }
    return field.valueAsNumber;
}

/**
 * Constrói o corpo JSON esperado pela rota associada ao formulário.
 * @param {HTMLFormElement} form Formulário submetido.
 * @param {string} path Caminho da API.
 * @returns {Object} Dados com as chaves do contrato da API.
 * @throws {Error} Quando os dados ou a rota são inválidos.
 */
function montarPayload(form, path) {
    switch (path) {
        case "/analise":
            return {
                salario: lerNumero(form, "salario"),
                gastos_fixos: lerNumero(form, "gastos_fixos"),
                dividas: lerNumero(form, "dividas"),
            };
        case "/meta":
            return {
                meta: lerNumero(form, "meta"),
                economia_mensal: lerNumero(form, "economia_mensal"),
            };
        case "/reserva-emergencia":
            return { gastos_fixos: lerNumero(form, "gastos_fixos") };
        case "/economia-potencial":
            return { saldo: lerNumero(form, "saldo") };
        case "/quitacao-divida":
            return {
                dividas: lerNumero(form, "dividas"),
                pagamento_mensal: lerNumero(form, "pagamento_mensal"),
            };
        case "/analise-despesas": {
            const fields = Array.from(form.querySelectorAll('input[name^="despesa-"]'));
            if (fields.length === 0 || fields.some((field) => !Number.isFinite(field.valueAsNumber))) {
                throw new Error("Preencha os valores das despesas.");
            }
            return { despesas: fields.map((field) => field.valueAsNumber) };
        }
        case "/chat": {
            const field = form.elements.namedItem("pergunta");
            if (!(field instanceof HTMLTextAreaElement) || !field.value.trim()) {
                throw new Error("Digite uma pergunta antes de enviar.");
            }
            return { pergunta: field.value.trim() };
        }
        default:
            throw new Error(`Rota da API não reconhecida: ${path}`);
    }
}

/**
 * Envia uma requisição à API e valida a resposta JSON e o status HTTP.
 * @param {string} path Caminho da API.
 * @param {RequestInit} options Opções do fetch.
 * @returns {Promise<Object|Array>} Dados decodificados da resposta.
 * @throws {Error} Em falha de conexão, HTTP ou JSON.
 */
async function requisitarJson(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, options);
    } catch {
        throw new Error("Não foi possível conectar à API. Confira se o servidor local está ativo e se CORS está configurado.");
    }

    let data;
    try {
        data = await response.json();
    } catch {
        if (!response.ok) {
            throw new Error(`A API respondeu com erro HTTP ${response.status}.`);
        }
        throw new Error("A API retornou uma resposta inválida.");
    }

    if (!response.ok) {
        const detail = data && typeof data.detail === "string" ? data.detail : null;
        throw new Error(detail || `A API respondeu com erro HTTP ${response.status}.`);
    }
    return data;
}

/**
 * Valida e obtém uma propriedade numérica de uma resposta da API.
 * @param {Object} data Resposta recebida.
 * @param {string} key Nome da propriedade.
 * @returns {number} Valor numérico validado.
 * @throws {Error} Quando a propriedade não contém número finito.
 */
function exigirNumero(data, key) {
    const value = data && data[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("A API retornou um resultado inesperado.");
    }
    return value;
}

/**
 * Acrescenta ao elemento um parágrafo textual seguro.
 * @param {HTMLElement} parent Elemento que receberá o parágrafo.
 * @param {string} label Rótulo apresentado.
 * @param {string|number} value Valor apresentado.
 * @returns {void}
 */
function adicionarValor(parent, label, value) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `${label}: ${value}`;
    parent.append(paragraph);
}

/**
 * Apresenta diagnóstico, gastos, saldo e percentual da análise financeira.
 * @param {HTMLElement} result Região de resultado.
 * @param {Object} data Resposta da rota /analise.
 * @returns {void}
 */
function renderizarAnalise(result, data) {
    if (!data || typeof data.diagnostico !== "string") {
        throw new Error("A API retornou um diagnóstico inválido.");
    }
    result.replaceChildren();
    adicionarValor(result, "Total de gastos", currencyFormatter.format(exigirNumero(data, "total_gastos")));
    adicionarValor(result, "Saldo", currencyFormatter.format(exigirNumero(data, "saldo")));
    adicionarValor(result, "Percentual de gastos", `${percentFormatter.format(exigirNumero(data, "percentual_gastos"))}%`);
    adicionarValor(result, "Diagnóstico", data.diagnostico);
}

/**
 * Renderiza o prazo e a tabela mensal de quitação da dívida.
 * @param {HTMLElement} result Região de resultado.
 * @param {Object} data Resposta da rota /quitacao-divida.
 * @returns {void}
 * @throws {Error} Quando o histórico retornado é inválido.
 */
function renderizarCronogramaDivida(result, data) {
    if (!Array.isArray(data?.historico)) {
        throw new Error("A API retornou um histórico de quitação inválido.");
    }
    result.replaceChildren();
    const scheduleHeading = document.createElement("div");
    scheduleHeading.className = "cabecalho-cronograma";
    const monthsText = document.createElement("p");
    const monthsLabel = document.createElement("strong");
    monthsLabel.textContent = "Meses para quitar:";
    monthsText.append(monthsLabel, ` ${exigirNumero(data, "meses_para_quitar")}`);
    const tableTitle = document.createElement("p");
    tableTitle.textContent = "Saldo restante por mês";
    scheduleHeading.append(monthsText, tableTitle);
    result.append(scheduleHeading);

    const table = document.createElement("table");
    table.className = "tabela";

    const head = document.createElement("thead");
    const headingRow = document.createElement("tr");
    for (const heading of ["Mês", "Dívida restante"]) {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = heading;
        headingRow.append(cell);
    }
    head.append(headingRow);
    table.append(head);

    const body = document.createElement("tbody");
    for (const item of data.historico) {
        const row = document.createElement("tr");
        const monthCell = document.createElement("td");
        monthCell.textContent = String(exigirNumero(item, "mes"));
        const balanceCell = document.createElement("td");
        balanceCell.textContent = currencyFormatter.format(exigirNumero(item, "divida_restante"));
        row.append(monthCell, balanceCell);
        body.append(row);
    }
    table.append(body);
    result.append(table);
}

/**
 * Apresenta o resumo estatístico das despesas.
 * @param {HTMLElement} result Região de resultado.
 * @param {Object} data Resposta da rota /analise-despesas.
 * @returns {void}
 */
function renderizarDespesas(result, data) {
    result.replaceChildren();
    const list = document.createElement("ul");
    for (const [label, key] of [
        ["Total", "total"],
        ["Maior despesa", "maior"],
        ["Menor despesa", "menor"],
        ["Média", "media"],
    ]) {
        const item = document.createElement("li");
        item.textContent = `${label}: ${currencyFormatter.format(exigirNumero(data, key))}`;
        list.append(item);
    }
    result.append(list);
}

/**
 * Atualiza os cards com as projeções de economia para três períodos.
 * @param {Object} data Resposta da rota /economia-potencial.
 * @returns {void}
 */
function renderizarEconomiaPotencial(data) {
    const results = [
        ["resultado-1-ano", "um_ano"],
        ["resultado-2-anos", "dois_anos"],
        ["resultado-5-anos", "cinco_anos"],
    ];
    for (const [elementId, key] of results) {
        obterElemento(elementId).textContent = currencyFormatter.format(exigirNumero(data, key));
    }
}

/**
 * Encaminha cada resposta para sua apresentação específica.
 * @param {string} path Caminho da API chamado.
 * @param {HTMLElement} result Região de resultado.
 * @param {Object} data Dados recebidos.
 * @returns {void}
 * @throws {Error} Quando a resposta não corresponde ao contrato esperado.
 */
function renderizarResultado(path, result, data) {
    switch (path) {
        case "/analise":
            renderizarAnalise(result, data);
            break;
        case "/meta":
            result.textContent = `Você atingirá sua meta em ${exigirNumero(data, "meses_para_atingir_meta")} meses.`;
            break;
        case "/reserva-emergencia":
            result.textContent = `Reserva recomendada: ${currencyFormatter.format(exigirNumero(data, "reserva_recomendada"))}.`;
            break;
        case "/economia-potencial":
            renderizarEconomiaPotencial(data);
            break;
        case "/quitacao-divida":
            renderizarCronogramaDivida(result, data);
            break;
        case "/analise-despesas":
            renderizarDespesas(result, data);
            break;
        case "/chat":
            if (!data || typeof data.resposta !== "string") {
                throw new Error("A API retornou uma resposta inválida.");
            }
            if (result.classList.contains("chat-conversa")) {
                adicionarMensagemChat(result, "Assistente", data.resposta);
            } else {
                result.textContent = data.resposta;
            }
            break;
        default:
            throw new Error(`Rota da API não reconhecida: ${path}`);
    }
}

/**
 * Limpa projeções antigas antes de calcular novos valores.
 * @returns {void}
 */
function limparResultadosEconomia() {
    for (const id of ["resultado-1-ano", "resultado-2-anos", "resultado-5-anos"]) {
        const result = document.getElementById(id);
        if (result) {
            result.textContent = "";
        }
    }
}

/**
 * Acrescenta uma mensagem segura ao histórico visual do chat e rola até ela.
 * @param {HTMLElement} conversa Região que contém as mensagens.
 * @param {string} remetente Nome exibido para quem enviou a mensagem.
 * @param {string} texto Conteúdo textual da mensagem.
 * @returns {HTMLElement} Elemento da mensagem recém-criada.
 */
function adicionarMensagemChat(conversa, remetente, texto) {
    const message = document.createElement("div");
    const sender = document.createElement("span");
    const content = document.createElement("p");
    const isUser = remetente === "Você";

    message.className = `chat-mensagem ${isUser ? "chat-mensagem-usuario" : "chat-mensagem-assistente"}`;
    sender.className = "chat-remetente";
    sender.textContent = remetente;
    content.textContent = texto;
    message.append(sender, content);
    conversa.append(message);
    conversa.scrollTop = conversa.scrollHeight;
    return message;
}

/**
 * Processa o envio de um formulário, exibe estados e apresenta a resposta da API.
 * @param {SubmitEvent} event Evento de submissão do formulário.
 * @returns {Promise<void>}
 */
async function tratarEnvioFormularioApi(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const path = form.dataset.apiPath;
    const result = form.dataset.resultId ? obterElemento(form.dataset.resultId) : null;
    const error = obterElemento(form.dataset.errorId);
    const status = form.dataset.statusId ? obterElemento(form.dataset.statusId) : null;
    const submitButton = form.querySelector('button[type="submit"]');
    const isConversation = path === "/chat" && result?.classList.contains("chat-conversa");
    let loadingMessage = null;

    error.textContent = "";
    if (path === "/economia-potencial") {
        limparResultadosEconomia();
    }
    if (result && !isConversation) {
        result.replaceChildren();
        result.textContent = path === "/chat" ? "Enviando pergunta..." : "Calculando...";
    }
    if (status) {
        status.textContent = "Calculando projeção...";
    }
    form.setAttribute("aria-busy", "true");
    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const payload = montarPayload(form, path);
        if (isConversation) {
            adicionarMensagemChat(result, "Você", payload.pergunta);
            loadingMessage = adicionarMensagemChat(result, "Assistente", "Pensando...");
            loadingMessage.classList.add("chat-mensagem-carregando");
        }
        const data = await requisitarJson(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (loadingMessage) {
            loadingMessage.remove();
        }
        if (result && !isConversation) {
            result.replaceChildren();
        }
        renderizarResultado(path, result, data);
        if (status) {
            status.textContent = "Projeção calculada.";
        }
    } catch (caught) {
        if (loadingMessage) {
            loadingMessage.remove();
        }
        if (result && result !== error && !isConversation) {
            result.replaceChildren();
        }
        const message = caught instanceof Error ? caught.message : "Ocorreu um erro inesperado.";
        error.textContent = message;
        if (status) {
            status.textContent = "";
        }
    } finally {
        form.removeAttribute("aria-busy");
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

/**
 * Adiciona uma análise salva como linha da tabela de histórico.
 * @param {HTMLElement} body Corpo da tabela.
 * @param {Object} entry Registro recebido da API.
 * @returns {void}
 * @throws {Error} Quando o registro não tem o formato esperado.
 */
function adicionarLinhaHistorico(body, entry) {
    if (!entry || typeof entry.diagnostico !== "string") {
        throw new Error("A API retornou um item de histórico inválido.");
    }
    const row = document.createElement("tr");
    const values = [
        currencyFormatter.format(exigirNumero(entry, "total_gastos")),
        currencyFormatter.format(exigirNumero(entry, "saldo")),
        `${percentFormatter.format(exigirNumero(entry, "percentual_gastos"))}%`,
        entry.diagnostico,
    ];
    for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
    }
    body.append(row);
}

/**
 * Busca e exibe o histórico de análises financeiras.
 * @returns {Promise<void>}
 */
async function carregarHistorico() {
    const body = obterElemento("historico-corpo");
    const emptyMessage = obterElemento("historico-vazio");
    const error = obterElemento("erro-historico");
    emptyMessage.textContent = "Carregando histórico...";
    emptyMessage.hidden = false;
    error.textContent = "";

    try {
        const entries = await requisitarJson("/historico");
        if (!Array.isArray(entries)) {
            throw new Error("A API retornou um histórico inválido.");
        }
        body.replaceChildren();
        for (const entry of entries) {
            adicionarLinhaHistorico(body, entry);
        }
        emptyMessage.hidden = entries.length > 0;
        emptyMessage.textContent = entries.length > 0 ? "" : "Nenhuma análise salva ainda.";
    } catch (caught) {
        emptyMessage.textContent = "";
        emptyMessage.hidden = true;
        error.textContent = caught instanceof Error ? caught.message : "Não foi possível carregar o histórico.";
    }
}

for (const form of document.querySelectorAll("form[data-api-path]")) {
    form.addEventListener("submit", tratarEnvioFormularioApi);
}

if (document.getElementById("historico-corpo")) {
    carregarHistorico();
}

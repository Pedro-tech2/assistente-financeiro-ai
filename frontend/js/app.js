const API_URL = "http://127.0.0.1:8000";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const percentFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
});

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Elemento necessário não encontrado: ${id}`);
    }
    return element;
}

function readNumber(form, name) {
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement) || !Number.isFinite(field.valueAsNumber)) {
        throw new Error("Confira os valores numéricos informados.");
    }
    return field.valueAsNumber;
}

function buildPayload(form, path) {
    switch (path) {
        case "/analise":
            return {
                salario: readNumber(form, "salario"),
                gastos_fixos: readNumber(form, "gastos_fixos"),
                dividas: readNumber(form, "dividas"),
            };
        case "/meta":
            return {
                meta: readNumber(form, "meta"),
                economia_mensal: readNumber(form, "economia_mensal"),
            };
        case "/reserva-emergencia":
            return { gastos_fixos: readNumber(form, "gastos_fixos") };
        case "/economia-potencial":
            return { saldo: readNumber(form, "saldo") };
        case "/quitacao-divida":
            return {
                dividas: readNumber(form, "dividas"),
                pagamento_mensal: readNumber(form, "pagamento_mensal"),
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

async function requestJson(path, options = {}) {
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

function requireNumber(data, key) {
    const value = data && data[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("A API retornou um resultado inesperado.");
    }
    return value;
}

function appendValue(parent, label, value) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `${label}: ${value}`;
    parent.append(paragraph);
}

function renderAnalysis(result, data) {
    if (!data || typeof data.diagnostico !== "string") {
        throw new Error("A API retornou um diagnóstico inválido.");
    }
    result.replaceChildren();
    appendValue(result, "Total de gastos", currencyFormatter.format(requireNumber(data, "total_gastos")));
    appendValue(result, "Saldo", currencyFormatter.format(requireNumber(data, "saldo")));
    appendValue(result, "Percentual de gastos", `${percentFormatter.format(requireNumber(data, "percentual_gastos"))}%`);
    appendValue(result, "Diagnóstico", data.diagnostico);
}

function renderDebtSchedule(result, data) {
    if (!Array.isArray(data?.historico)) {
        throw new Error("A API retornou um histórico de quitação inválido.");
    }
    result.replaceChildren();
    appendValue(result, "Meses para quitar", requireNumber(data, "meses_para_quitar"));

    const table = document.createElement("table");
    table.className = "tabela";
    const caption = document.createElement("caption");
    caption.textContent = "Saldo restante por mês";
    table.append(caption);

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
        monthCell.textContent = String(requireNumber(item, "mes"));
        const balanceCell = document.createElement("td");
        balanceCell.textContent = currencyFormatter.format(requireNumber(item, "divida_restante"));
        row.append(monthCell, balanceCell);
        body.append(row);
    }
    table.append(body);
    result.append(table);
}

function renderExpenses(result, data) {
    result.replaceChildren();
    const list = document.createElement("ul");
    for (const [label, key] of [
        ["Total", "total"],
        ["Maior despesa", "maior"],
        ["Menor despesa", "menor"],
        ["Média", "media"],
    ]) {
        const item = document.createElement("li");
        item.textContent = `${label}: ${currencyFormatter.format(requireNumber(data, key))}`;
        list.append(item);
    }
    result.append(list);
}

function renderPotentialSavings(data) {
    const results = [
        ["resultado-1-ano", "um_ano"],
        ["resultado-2-anos", "dois_anos"],
        ["resultado-5-anos", "cinco_anos"],
    ];
    for (const [elementId, key] of results) {
        getElement(elementId).textContent = currencyFormatter.format(requireNumber(data, key));
    }
}

function renderResult(path, result, data) {
    switch (path) {
        case "/analise":
            renderAnalysis(result, data);
            break;
        case "/meta":
            result.textContent = `Você atingirá sua meta em ${requireNumber(data, "meses_para_atingir_meta")} meses.`;
            break;
        case "/reserva-emergencia":
            result.textContent = `Reserva recomendada: ${currencyFormatter.format(requireNumber(data, "reserva_recomendada"))}.`;
            break;
        case "/economia-potencial":
            renderPotentialSavings(data);
            break;
        case "/quitacao-divida":
            renderDebtSchedule(result, data);
            break;
        case "/analise-despesas":
            renderExpenses(result, data);
            break;
        case "/chat":
            if (!data || typeof data.resposta !== "string") {
                throw new Error("A API retornou uma resposta inválida.");
            }
            result.textContent = data.resposta;
            break;
        default:
            throw new Error(`Rota da API não reconhecida: ${path}`);
    }
}

function clearPotentialSavings() {
    for (const id of ["resultado-1-ano", "resultado-2-anos", "resultado-5-anos"]) {
        const result = document.getElementById(id);
        if (result) {
            result.textContent = "";
        }
    }
}

async function handleApiFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const path = form.dataset.apiPath;
    const result = form.dataset.resultId ? getElement(form.dataset.resultId) : null;
    const error = getElement(form.dataset.errorId);
    const status = form.dataset.statusId ? getElement(form.dataset.statusId) : null;
    const submitButton = form.querySelector('button[type="submit"]');

    error.textContent = "";
    if (path === "/economia-potencial") {
        clearPotentialSavings();
    }
    if (result) {
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
        const payload = buildPayload(form, path);
        const data = await requestJson(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (result) {
            result.replaceChildren();
        }
        renderResult(path, result, data);
        if (status) {
            status.textContent = "Projeção calculada.";
        }
    } catch (caught) {
        if (result && result !== error) {
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

function appendHistoryRow(body, entry) {
    if (!entry || typeof entry.diagnostico !== "string") {
        throw new Error("A API retornou um item de histórico inválido.");
    }
    const row = document.createElement("tr");
    const values = [
        currencyFormatter.format(requireNumber(entry, "total_gastos")),
        currencyFormatter.format(requireNumber(entry, "saldo")),
        `${percentFormatter.format(requireNumber(entry, "percentual_gastos"))}%`,
        entry.diagnostico,
    ];
    for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
    }
    body.append(row);
}

async function loadHistory() {
    const body = getElement("historico-corpo");
    const emptyMessage = getElement("historico-vazio");
    const error = getElement("erro-historico");
    emptyMessage.textContent = "Carregando histórico...";
    emptyMessage.hidden = false;
    error.textContent = "";

    try {
        const entries = await requestJson("/historico");
        if (!Array.isArray(entries)) {
            throw new Error("A API retornou um histórico inválido.");
        }
        body.replaceChildren();
        for (const entry of entries) {
            appendHistoryRow(body, entry);
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
    form.addEventListener("submit", handleApiFormSubmit);
}

if (document.getElementById("historico-corpo")) {
    loadHistory();
}

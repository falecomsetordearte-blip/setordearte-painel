async function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = "login.html";
        return true;
    }
    return false;
}

function detectarErroSessaoSubstituida(error) {
    const mensagemErro = error.message || error.toString();
    const padroesSessaoInvalida = [
        'Unexpected token',
        'is not valid JSON',
        'Você entrou',
        'message\': Você',
        'SyntaxError'
    ];
    const isErroSessao = padroesSessaoInvalida.some(padrao =>
        mensagemErro.includes(padrao)
    );
    return isErroSessao;
}

function exibirAlertaSessaoSubstituida() {
    let modal = document.getElementById('modal-sessao-substituida');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-sessao-substituida';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content sessao-substituida">
                    <div class="modal-body">
                        <h3>Sessão Expirada</h3>
                        <p>Entre novamente.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="btn-ok-login" class="btn btn-primary">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (!document.getElementById('sessao-substituida-styles')) {
            const styles = document.createElement('style');
            styles.id = 'sessao-substituida-styles';
            styles.textContent = `
                #modal-sessao-substituida .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 10000; }
                #modal-sessao-substituida .modal-content.sessao-substituida { background: white; border-radius: 12px; padding: 0; max-width: 350px; width: 90%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); animation: slideIn 0.3s ease-out; }
                #modal-sessao-substituida .modal-body { padding: 30px 25px 20px 25px; text-align: center; }
                #modal-sessao-substituida .modal-body h3 { margin: 0 0 15px 0; color: #333; font-size: 1.3em; font-weight: 600; }
                #modal-sessao-substituida .modal-body p { margin: 0; color: #666; line-height: 1.5; }
                #modal-sessao-substituida .modal-footer { padding: 0 25px 25px 25px; text-align: center; }
                #modal-sessao-substituida .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 1em; font-weight: 500; cursor: pointer; transition: all 0.3s ease; min-width: 100px; }
                #modal-sessao-substituida .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
            `;
            document.head.appendChild(styles);
        }
    }
    modal.style.display = 'block';
    const btnOk = document.getElementById('btn-ok-login');
    btnOk.onclick = () => {
        localStorage.clear();
        window.location.href = "login.html";
    };
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            localStorage.clear();
            window.location.href = "login.html";
        }
    });
}

const LOGIN_WEBHOOK_URL = 'https://hook.us2.make.com/dqxm5s3btz5th4qhrm7mr7tf2esg7776';
const VERIFICACAO_WEBHOOK_URL = 'https://hook.us2.make.com/noiou4qy5rshoy7scrafe9cudjclkb8x';
const ESQUECI_SENHA_WEBHOOK_URL = 'https://hook.us2.make.com/0hkjdys97cuy5higrj7d2v79r8bokosr';
const REDEFINIR_SENHA_WEBHOOK_URL = 'https://hook.us2.make.com/qn76utbyrx6niz7dv67exap2ukikouv3';
const CRIAR_PEDIDO_WEBHOOK_URL = 'https://hook.us2.make.com/548en3dbsynv4c2e446jvcwrizl7trut';
const PAGAR_COM_SALDO_URL = 'https://hook.us2.make.com/3dtcbbrxqh1s2o8cdcjxj37iyq4bd736';
const GERAR_COBRANCA_URL = 'https://hook.us2.make.com/7ub1y8w9v23rkyd6tumh84p5l21knquv';
const ADICIONAR_CREDITOS_URL = 'https://hook.us2.make.com/5p9m8o8p6hhglqlmxkj5sc7t2ztr8yic';

function showFeedback(containerId, message, isError = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.textContent = message;
    container.className = `form-feedback ${isError ? 'error' : 'success'}`;
    container.classList.remove('hidden');
}

function hideFeedback(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.classList.add('hidden');
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formWrapper = document.getElementById('form-wrapper');
        const loadingFeedback = document.getElementById('loading-feedback');
        const submitButton = cadastroForm.querySelector('button[type="submit"]');

        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const aceiteTermos = document.getElementById('termos-aceite').checked;

        hideFeedback('form-error-feedback');

        if (!aceiteTermos) {
            return showFeedback('form-error-feedback', 'Você precisa aceitar os Termos para continuar.', true);
        }
        if (senha.length < 6) {
            return showFeedback('form-error-feedback', 'Sua senha precisa ter no mínimo 6 caracteres.', true);
        }
        if (senha !== confirmarSenha) {
            return showFeedback('form-error-feedback', 'As senhas não coincidem.', true);
        }

        submitButton.disabled = true;
        formWrapper.classList.add('hidden');
        loadingFeedback.classList.remove('hidden');

        const empresaData = {
            nomeEmpresa: document.getElementById('nome_empresa').value,
            cnpj: document.getElementById('cnpj').value,
            telefoneEmpresa: document.getElementById('telefone_empresa').value,
            nomeResponsavel: document.getElementById('nome_responsavel').value,
            email: document.getElementById('email').value,
            senha: senha
        };

        try {
            const response = await fetch('/api/registerUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empresaData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ocorreu um erro desconhecido.');
            }

            window.location.href = data.checkoutUrl;

        } catch (error) {
            loadingFeedback.classList.add('hidden');
            formWrapper.classList.remove('hidden');
            showFeedback('form-error-feedback', error.message, true);
            submitButton.disabled = false;
        }
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        try {
            const response = await fetch(LOGIN_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: document.getElementById('email').value, senha: document.getElementById('senha').value })
            });

            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.message || 'Ocorreu um erro desconhecido.';
                throw new Error(errorMessage);
            }

            localStorage.setItem('sessionToken', data.token);
            localStorage.setItem('userName', data.userName);
            window.location.href = 'painel.html';
        } catch (error) {
            showFeedback('form-error-feedback', error.message, true);
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
}

const esqueciSenhaForm = document.getElementById('esqueci-senha-form');
if (esqueciSenhaForm) {
    const formWrapper = document.getElementById('form-wrapper');
    esqueciSenhaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const btn = event.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            const response = await fetch(ESQUECI_SENHA_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: document.getElementById('email').value })
            });
            const data = await response.json();

            formWrapper.innerHTML = `
                <div class="auth-header">
                    <img src="https://setordearte.com.br/images/logo.svg" alt="Logo Setor de Arte">
                    <h1>Link Enviado!</h1>
                    <p>${data.message || 'Se um e-mail correspondente for encontrado, um link de recuperação será enviado.'}</p>
                </div>`;
        } catch (error) {
            formWrapper.innerHTML = `
                <div class="auth-header">
                    <img src="https://setordearte.com.br/images/logo-redonda.svg" alt="Logo Setor de Arte">
                    <h1>Ocorreu um Erro</h1>
                    <p>Não foi possível processar a solicitação. Por favor, tente novamente mais tarde.</p>
                </div>`;
        }
    });
}

const redefinirSenhaForm = document.getElementById('redefinir-senha-form');
if (redefinirSenhaForm) {
    redefinirSenhaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        const submitButton = redefinirSenhaForm.querySelector('button[type="submit"]');

        hideFeedback('form-error-feedback');

        if (novaSenha.length < 6) {
            return showFeedback('form-error-feedback', 'Sua senha precisa ter no mínimo 6 caracteres.', true);
        }
        if (novaSenha !== confirmarSenha) {
            return showFeedback('form-error-feedback', 'As senhas não coincidem.', true);
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            showFeedback('form-error-feedback', 'Token de redefinição não encontrado. Link inválido.', true);
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
            return;
        }

        try {
            const response = await fetch(REDEFINIR_SENHA_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, novaSenha: novaSenha })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message); }

            window.location.href = `login.html?reset=success`;

        } catch (error) {
            showFeedback('form-error-feedback', error.message, true);
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
        }
    });
}

if (window.location.pathname.includes('/verificacao')) {
    const feedbackText = document.getElementById('feedback-text');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const action = urlParams.get('action') || 'ativar_conta';

    if (!token) {
        feedbackText.textContent = 'Link inválido ou incompleto.';
    } else {
        if (action === 'ativar_conta') {
            feedbackText.textContent = 'Ativando sua conta, um momento...';

            const urlComToken = new URL(VERIFICACAO_WEBHOOK_URL);
            urlComToken.searchParams.append('token', token);

            fetch(urlComToken)
                .then(res => {
                    if (!res.ok) { return res.json().then(errData => { throw new Error(errData.message || 'Erro de verificação') }); }
                    return res.json();
                })
                .then(data => {
                    if (data.status !== 'success') { throw new Error(data.message || 'Não foi possível verificar a conta.'); }
                    window.location.href = `login.html?verified=true`;
                })
                .catch(err => {
                    window.location.href = `login.html?error=${encodeURIComponent(err.message)}`;
                });

        } else if (action === 'redefinir_senha') {
            feedbackText.textContent = 'Redirecionando para a página de redefinição de senha...';
            window.location.href = `redefinir-senha.html?token=${token}`;

        } else {
            feedbackText.textContent = 'Ação desconhecida. Link inválido.';
        }
    }
}

let todosPedidos = [];
let notificacoesMap = {};
let paginaAtual = 1;
const itensPorPagina = 20;
let pedidosFiltrados = [];

async function atualizarDadosPainel() {
    const sessionToken = localStorage.getItem("sessionToken");
    const mainPainel = document.querySelector(".main-painel");
    const pedidosListBody = document.getElementById("pedidos-list-body");
    const saldoValorEl = document.getElementById("saldo-valor");
    
    if (!sessionToken) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('/api/getPanelData', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: sessionToken })
        });
        
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            if (detectarErroSessaoSubstituida(jsonError)) {
                exibirAlertaSessaoSubstituida();
                return;
            }
            throw jsonError;
        }
        
        if (!response.ok) { 
            if (await handleAuthError(response)) { return; } 
            throw new Error(data.message || "Erro ao buscar dados."); 
        }

        if (data.statusConta && data.statusConta !== 'Ativo') {
            document.body.innerHTML = `<div class="auth-page"><div class="auth-container" style="text-align: center;"><img src="https://setordearte.com.br/images/logo-redonda.svg" alt="Logo Setor de Arte" style="height: 80px; margin-bottom: 20px;"><h1>Acesso Suspenso</h1><p style="color: var(--cinza-texto); line-height: 1.6;">Sua assinatura está com uma pendência de pagamento e seu acesso foi temporariamente suspenso.</p><p style="color: var(--cinza-texto); line-height: 1.6; margin-top: 20px;">Para reativar seu acesso, por favor, regularize sua mensalidade através do link enviado para seu e-mail ou entre em contato com nosso suporte.</p><a href="login.html" style="display: inline-block; margin-top: 30px; color: var(--azul-principal); font-weight: 600;">Sair</a></div></div>`;
            localStorage.clear();
            return;
        }

        saldoValorEl.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.saldo || 0);
        todosPedidos = data.pedidos || [];
        
        if (data.notificacao && Array.isArray(data.notificacao)) {
            notificacoesMap = data.notificacao.reduce((mapa, item) => {
                const id = item["0"];
                const status = item["3"];
                if (id) {
                    mapa[id] = status;
                }
                return mapa;
            }, {});
        } else {
            notificacoesMap = {};
        }
    
        paginaAtual = 1; 
        aplicarFiltros();

    } catch (error) {
        if (detectarErroSessaoSubstituida(error)) {
            exibirAlertaSessaoSubstituida();
            return;
        }
        pedidosListBody.innerHTML = `<div class="loading-pedidos" style="color: var(--erro);">${error.message}</div>`;
    }
}

function renderizarPedidos(pedidos) {
    const pedidosListBody = document.getElementById("pedidos-list-body");
    const paginationContainer = document.getElementById("pagination-container");

    pedidosListBody.innerHTML = "";
    pedidosFiltrados = pedidos;

    if (pedidos && pedidos.length > 0) {
        const indiceInicio = (paginaAtual - 1) * itensPorPagina;
        const indiceFim = indiceInicio + itensPorPagina;
        const pedidosPagina = pedidos.slice(indiceInicio, indiceFim);

        let pedidosHtml = "";
        pedidosPagina.forEach(pedido => {
            let statusInfo = { texto: "Desconhecido", classe: "" };
            let notificacaoHtml = ''; 
            if (notificacoesMap[pedido.ID] === 'Y') {
                notificacaoHtml = '<span class="notificacao-badge"><i class="fa-solid fa-circle"></i></span>';
            }
            let acaoHtml = `<a href="pedido.html?id=${pedido.ID}" class="btn-ver-pedido">Ver Detalhes${notificacaoHtml}</a>`;
            const stageId = pedido.STAGE_ID || "";

            if (stageId === "NEW" || stageId === "C17:NEW") {
                statusInfo = { texto: "Aguardando Pagamento", classe: "status-pagamento" };
                acaoHtml = `<div class="dropdown-pagamento"><button class="btn-pagar" data-deal-id="${pedido.ID}">Pagar Agora</button><div class="dropdown-content"><button class="btn-pagar-saldo" data-deal-id="${pedido.ID}" data-valor="${(parseFloat(pedido.OPPORTUNITY) || 0).toFixed(2)}">Usar Saldo</button><button class="btn-gerar-cobranca" data-deal-id="${pedido.ID}">PIX</button></div></div>`;
            } else if (stageId === "LOSE") {
                statusInfo = { texto: "Cancelado", classe: "status-cancelado" };
            } else if (stageId === "C17:UC_2OEE24") {
                statusInfo = { texto: "Em Análise", classe: "status-analise" };
            } else if (stageId === "C17:PREPARATION" || stageId === "C17:UC_Y31VM3" || stageId === "C17:UC_HX3875" || stageId === "C17:UC_EYLXL0") {
                statusInfo = { texto: "Em Andamento", classe: "status-andamento" };
            } else if (stageId === "C17:1" || stageId.includes("WON")) {
                statusInfo = { texto: "Aprovado", classe: "status-aprovado" };
            } else if (stageId === "C17:WON" || stageId.includes("C19")) {
                statusInfo = { texto: "Verificado", classe: "status-verificado" };
            } else {
                statusInfo = { texto: "Em Andamento", classe: "status-andamento" };
            }

            const valorFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(pedido.OPPORTUNITY) || 0);
            const pedidoHtml = `
                <div class="pedido-item" data-status="${statusInfo.texto.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="col-id"><strong>#${pedido.ID}</strong></div>
                    <div class="col-titulo">${pedido.TITLE}</div>
                    <div class="col-status"><span class="status-badge ${statusInfo.classe}">${statusInfo.texto}</span></div>
                    <div class="col-valor">${valorFormatado}</div>
                    <div class="col-acoes">${acaoHtml}</div>
                </div>`;
            pedidosHtml += pedidoHtml;
        });

        pedidosListBody.innerHTML = pedidosHtml;

        if (pedidos.length > itensPorPagina) {
            paginationContainer.classList.remove("hidden");
            atualizarControlesPaginacao(pedidos.length);
        } else {
            paginationContainer.classList.add("hidden");
        }
    } else {
        pedidosListBody.innerHTML = "<div class=\"loading-pedidos\" style=\"padding: 50px 20px;\">Nenhum pedido encontrado.</div>";
        paginationContainer.classList.add("hidden");
    }
}

function aplicarFiltros() {
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const statusSelected = statusFilter ? statusFilter.value : "todos";
    let pedidosFiltradosLocal = todosPedidos;

    if (searchTerm) {
        pedidosFiltradosLocal = pedidosFiltradosLocal.filter(pedido => {
            const titulo = (pedido.TITLE || "").toLowerCase();
            const id = (pedido.ID || "").toString();
            return titulo.includes(searchTerm) || id.includes(searchTerm);
        });
    }

    if (statusSelected !== "todos") {
        pedidosFiltradosLocal = pedidosFiltradosLocal.filter(pedido => {
            const stageId = pedido.STAGE_ID || "";
            switch (statusSelected) {
                case "pagamento": return stageId.includes("NEW");
                case "analise": return stageId === "C17:UC_2OEE24";
                case "andamento": return !stageId.includes("NEW") && stageId !== "C17:UC_2OEE24" && !stageId.includes("WON") && !stageId.includes("LOSE");
                case "finalizado": return stageId.includes("WON") && stageId !== "C17:WON";
                case "verificado": return stageId === "C17:WON" || stageId.includes("C19");
                case "cancelado": return stageId.includes("LOSE");
                default: return true;
            }
        });
    }

    paginaAtual = 1;
    renderizarPedidos(pedidosFiltradosLocal);
}

function irParaPagina(pagina) {
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaAtual = pagina;
        renderizarPedidos(pedidosFiltrados);
    }
}

function atualizarControlesPaginacao(totalItens) {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);
    const indiceInicio = (paginaAtual - 1) * itensPorPagina + 1;
    const indiceFim = Math.min(paginaAtual * itensPorPagina, totalItens);
    
    document.getElementById("pagination-info-text").textContent = `Mostrando ${indiceInicio}-${indiceFim} de ${totalItens} pedidos`;
    
    const btnFirstPage = document.getElementById("btn-first-page");
    const btnPrevPage = document.getElementById("btn-prev-page");
    const btnNextPage = document.getElementById("btn-next-page");
    const btnLastPage = document.getElementById("btn-last-page");
    
    btnFirstPage.disabled = paginaAtual === 1;
    btnPrevPage.disabled = paginaAtual === 1;
    btnNextPage.disabled = paginaAtual === totalPaginas;
    btnLastPage.disabled = paginaAtual === totalPaginas;

    const paginationPages = document.getElementById("pagination-pages");
    paginationPages.innerHTML = "";

    let paginaInicio = Math.max(1, paginaAtual - 2);
    let paginaFim = Math.min(totalPaginas, paginaAtual + 2);

    if (paginaFim - paginaInicio < 4) {
        if (paginaInicio === 1) {
            paginaFim = Math.min(totalPaginas, paginaInicio + 4);
        } else {
            paginaInicio = Math.max(1, paginaFim - 4);
        }
    }

    for (let i = paginaInicio; i <= paginaFim; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-page-btn ${i === paginaAtual ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener("click", () => irParaPagina(i));
        paginationPages.appendChild(btn);
    }
}

function inicializarPainel() {
    const painelContent = document.body.querySelector(".main-painel");
    if (!painelContent) return;

    const sessionToken = localStorage.getItem("sessionToken");
    const userName = localStorage.getItem("userName");

    if (!sessionToken) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    const userGreeting = document.getElementById("user-greeting");
    const logoutButton = document.getElementById("logout-button");
    const modal = document.getElementById("modal-novo-pedido");
    const btnOpenModal = document.querySelector(".btn-novo-pedido");
    const btnCloseModal = modal.querySelector(".close-modal");
    const novoPedidoForm = document.getElementById("novo-pedido-form");
    const pedidosListBody = document.getElementById("pedidos-list-body");
    const modalCreditos = document.getElementById("modal-adquirir-creditos");
    const btnOpenModalCreditos = document.querySelector(".btn-add-credito");
    const btnCloseModalCreditos = modalCreditos.querySelector(".close-modal");
    const adquirirCreditosForm = document.getElementById("adquirir-creditos-form");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const btnFirstPage = document.getElementById("btn-first-page");
    const btnPrevPage = document.getElementById("btn-prev-page");
    const btnNextPage = document.getElementById("btn-next-page");
    const btnLastPage = document.getElementById("btn-last-page");
    
    userGreeting.textContent = `Olá, ${userName}!`;
    logoutButton.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    btnOpenModal.addEventListener("click", () => modal.classList.add("active"));
    btnCloseModal.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.classList.remove("active"); });
    
    if (btnOpenModalCreditos && modalCreditos && btnCloseModalCreditos) {
        btnOpenModalCreditos.addEventListener("click", () => modalCreditos.classList.add("active"));
        btnCloseModalCreditos.addEventListener("click", () => modalCreditos.classList.remove("active"));
        modalCreditos.addEventListener("click", (event) => {
            if (event.target === modalCreditos) modalCreditos.classList.remove("active");
        });
    }

    if (adquirirCreditosForm) {
        adquirirCreditosForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitButton = adquirirCreditosForm.querySelector("button[type='submit']");
            const valorAdicionado = document.getElementById("creditos-valor").value;

            hideFeedback("creditos-form-error");
            submitButton.disabled = true;
            submitButton.textContent = "Gerando...";

            try {
                const response = await fetch(ADICIONAR_CREDITOS_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken, valor: valorAdicionado })
                });

                const data = await response.json();
                if (!response.ok) { throw new Error(data.message || "Não foi possível gerar a cobrança."); }
                if (data.paymentLink) window.open(data.paymentLink, "_blank");
                
                modalCreditos.classList.remove("active");
                adquirirCreditosForm.reset();
                await new Promise(resolve => setTimeout(resolve, 1000));
                await atualizarDadosPainel();

            } catch (error) {
                showFeedback("creditos-form-error", error.message, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Pagar";
            }
        });
    }

    novoPedidoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = novoPedidoForm.querySelector("button[type=\"submit\"]");
        
        const arquivosLink = document.getElementById("pedido-arquivos-link").value.trim();
        if (arquivosLink && !isValidURL(arquivosLink)) {
            showFeedback("pedido-form-error", "Por favor, insira um link válido.", true);
            return;
        }
        
        submitButton.disabled = true;
        submitButton.textContent = "Criando...";
        hideFeedback("pedido-form-error");

        const pedidoData = { 
            token: sessionToken, 
            titulo: document.getElementById("pedido-titulo").value, 
            cliente_nome: document.getElementById("cliente-final-nome").value, 
            cliente_wpp: document.getElementById("cliente-final-wpp").value, 
            briefing: document.getElementById("pedido-briefing").value, 
            valor: document.getElementById("pedido-valor").value,
            formato: document.getElementById("pedido-formato").value,
            arquivos_link: arquivosLink
        };

        try {
            const response = await fetch(CRIAR_PEDIDO_WEBHOOK_URL, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(pedidoData) 
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.message || "Erro ao criar pedido."); }

            alert("Pedido criado!");
            modal.classList.remove("active");
            novoPedidoForm.reset();
            await atualizarDadosPainel();

        } catch (error) {
            showFeedback("pedido-form-error", error.message, true);
        } finally {
             submitButton.disabled = false;
             submitButton.textContent = "Criar Pedido";
        }
    });

    pedidosListBody.addEventListener("click", async (event) => {
        const target = event.target;
        const dropdown = target.closest(".dropdown-pagamento");

        if (target.classList.contains("btn-pagar")) {
            event.stopPropagation();
            document.querySelectorAll(".dropdown-pagamento.active").forEach(d => { if (d !== dropdown) d.classList.remove("active"); });
            if (dropdown) dropdown.classList.toggle("active");
            return;
        }

        const dealId = target.dataset.dealId;
        if (!dealId) return;

        if (target.classList.contains("btn-pagar-saldo")) {
            const valor = target.dataset.valor;
            if (confirm(`Confirma o pagamento de R$ ${valor} usando seu saldo?`)) {
                fetch(PAGAR_COM_SALDO_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: sessionToken, dealId: dealId })
                })
            }
        }

        if (target.classList.contains("btn-gerar-cobranca")) {
            target.textContent = "Gerando...";
            target.disabled = true;
            try {
                const response = await fetch(GERAR_COBRANCA_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: sessionToken, dealId: dealId }) });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.message); }
                window.open(data.paymentLink, "_blank");
                if (dropdown) dropdown.classList.remove("active");
            } catch (err) {
                alert(`Erro: ${err.message}`);
            } finally {
                target.textContent = "PIX";
                target.disabled = false;
            }
        }
    });

    window.addEventListener("click", (e) => {
        if (!e.target.matches(".btn-pagar")) {
            document.querySelectorAll(".dropdown-pagamento.active").forEach(d => d.classList.remove("active"));
        }
    });
    
    if (searchInput) searchInput.addEventListener("input", aplicarFiltros);
    if (statusFilter) statusFilter.addEventListener("change", aplicarFiltros);
    
    if (btnFirstPage) btnFirstPage.addEventListener("click", () => irParaPagina(1));
    if (btnPrevPage) btnPrevPage.addEventListener("click", () => irParaPagina(paginaAtual - 1));
    if (btnNextPage) btnNextPage.addEventListener("click", () => irParaPagina(paginaAtual + 1));
    if (btnLastPage) btnLastPage.addEventListener("click", () => {
        const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
        irParaPagina(totalPaginas);
    });

    if (document.body.contains(document.getElementById("pedidos-list-body"))) {
        atualizarDadosPainel();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.body.contains(document.getElementById("pedidos-list-body"))) {
        inicializarPainel();
    }
});

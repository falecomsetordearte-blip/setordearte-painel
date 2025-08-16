async function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = "login";
        return true;
    }
    return false;
}

// FUNÇÃO PARA DETECTAR ERRO DE SESSÃO SUBSTITUÍDA
function detectarErroSessaoSubstituida(error) {
    const mensagemErro = error.message || error.toString();
    
    // Detectar padrões específicos do erro de sessão substituída
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

// FUNÇÃO PARA EXIBIR ALERTA DE SESSÃO SUBSTITUÍDA
function exibirAlertaSessaoSubstituida() {
    // Criar modal simples se não existir
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
        
        // Adicionar estilos CSS se não existirem
        if (!document.getElementById('sessao-substituida-styles')) {
            const styles = document.createElement('style');
            styles.id = 'sessao-substituida-styles';
            styles.textContent = `
                #modal-sessao-substituida .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                
                #modal-sessao-substituida .modal-content.sessao-substituida {
                    background: white;
                    border-radius: 12px;
                    padding: 0;
                    max-width: 350px;
                    width: 90%;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                }
                
                #modal-sessao-substituida .modal-body {
                    padding: 30px 25px 20px 25px;
                    text-align: center;
                }
                
                #modal-sessao-substituida .modal-body h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.3em;
                    font-weight: 600;
                }
                
                #modal-sessao-substituida .modal-body p {
                    margin: 0;
                    color: #666;
                    line-height: 1.5;
                }
                
                #modal-sessao-substituida .modal-footer {
                    padding: 0 25px 25px 25px;
                    text-align: center;
                }
                
                #modal-sessao-substituida .btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 1em;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 100px;
                }
                
                #modal-sessao-substituida .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    // Exibir modal
    modal.style.display = 'block';
    
    // Configurar botão OK
    const btnOk = document.getElementById('btn-ok-login');
    btnOk.onclick = () => {
        localStorage.clear();
        window.location.href = "login";
    };
    
    // Permitir fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            localStorage.clear();
            window.location.href = "login";
        }
    });
}

// ===================================================================
//  CONFIGURAÇÃO CENTRAL - URLs e Chaves de API
// ===================================================================
const FRONTEND_API_KEY =
    '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFiZWYxYTUxLWMwNGQtNDJlZC05M2I5LTFmMDI5ZGNjY2Y5MDo6JGFhY2hfMjM0NzUxMjItYjlkNi00NzRmLWI4YWEtOGI2NmNhZGNkMTUy';

const CADASTRO_WEBHOOK_URL = 'https://hook.us2.make.com/vnehayady4n2mhhu1hmu7w2z6x3nqpep';
const LOGIN_WEBHOOK_URL = 'https://hook.us2.make.com/dqxm5s3btz5th4qhrm7mr7tf2esg7776';
const VERIFICACAO_WEBHOOK_URL = 'https://hook.us2.make.com/noiou4qy5rshoy7scrafe9cudjclkb8x';
const ESQUECI_SENHA_WEBHOOK_URL = 'https://hook.us2.make.com/0hkjdys97cuy5higrj7d2v79r8bokosr';
const REDEFINIR_SENHA_WEBHOOK_URL = 'https://hook.us2.make.com/qn76utbyrx6niz7dv67exap2ukikouv3';


const CRIAR_PEDIDO_WEBHOOK_URL = 'https://hook.us2.make.com/548en3dbsynv4c2e446jvcwrizl7trut';
const PAGAR_COM_SALDO_URL = 'https://hook.us2.make.com/3dtcbbrxqh1s2o8cdcjxj37iyq4bd736';
const GERAR_COBRANCA_URL = 'https://hook.us2.make.com/7ub1y8w9v23rkyd6tumh84p5l21knquv';
const ADICIONAR_CREDITOS_URL = 'https://hook.us2.make.com/5p9m8o8p6hhglqlmxkj5sc7t2ztr8yic';

// ===================================================================
//  FUNÇÕES AUXILIARES DE FEEDBACK VISUAL
// ===================================================================
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

// Função para validar URL
function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ===================================================================
//  LÓGICA DA PÁGINA DE CADASTRO (BLOCO INTEIRO SUBSTITUÍDO)
// ===================================================================
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

        // Bloco de coleta de dados CORRIGIDO E SIMPLIFICADO
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

    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length !== 8) return;
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (data.erro) throw new Error('CEP não encontrado');
                document.getElementById('logradouro').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        });
    }
}


// ===================================================================
//  LÓGICA DA PÁGINA DE LOGIN
// ===================================================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        try {
            const response = await fetch(LOGIN_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-make-apikey': FRONTEND_API_KEY },
                body: JSON.stringify({ email: document.getElementById('email').value, senha: document.getElementById('senha').value })
            });

            const data = await response.json();
            if (!response.ok) { if (await handleAuthError(response)) { return; } const errorMessage = data.message || 'Ocorreu um erro desconhecido.'; throw new Error(errorMessage); }

            localStorage.setItem('sessionToken', data.token);
            localStorage.setItem('userName', data.userName);
            window.location.href = 'painel';
        } catch (error) {
            const feedbackElement = document.getElementById('form-error-feedback');
            if (feedbackElement) {
                feedbackElement.textContent = error.message;
                feedbackElement.classList.remove('hidden');
            }
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
}

// ===================================================================
//  LÓGICA DA PÁGINA ESQUECI-SENHA
// ===================================================================
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
                headers: { 'Content-Type': 'application/json', 'x-make-apikey': FRONTEND_API_KEY },
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

// ===================================================================
//  LÓGICA DA PÁGINA DE REDEFINIÇÃO DE SENHA
// ===================================================================
const redefinirSenhaForm = document.getElementById('redefinir-senha-form');
if (redefinirSenhaForm) {
    const submitButton = redefinirSenhaForm.querySelector('button[type="submit"]');

    redefinirSenhaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

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
                headers: { 'Content-Type': 'application/json', 'x-make-apikey': FRONTEND_API_KEY },
                body: JSON.stringify({ token: token, novaSenha: novaSenha })
            });
            const data = await response.json();
            if (!response.ok) { if (await handleAuthError(response)) { return; } throw new Error(data.message); }

            window.location.href = `login?reset=success`;

        } catch (error) {
            showFeedback('form-error-feedback', error.message, true);
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Nova Senha';
        }
    });
}

// ===================================================================
//  LÓGICA DA PÁGINA DE VERIFICAÇÃO - CORRIGIDA
// ===================================================================
if (window.location.pathname.includes('/verificacao')) {
    const feedbackText = document.getElementById('feedback-text');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // CORREÇÃO: Define 'ativar_conta' como ação padrão se 'action' não estiver na URL
    const action = urlParams.get('action') || 'ativar_conta';

    if (!token) { // Verificamos apenas o token, pois a ação agora tem um padrão
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
                    window.location.href = `login?verified=true`;
                })
                .catch(err => {
                    window.location.href = `login?error=${encodeURIComponent(err.message)}`;
                });

        } else if (action === 'redefinir_senha') {
            feedbackText.textContent = 'Redirecionando para a página de redefinição de senha...';
            window.location.href = `redefinir-senha?token=${token}`;

        } else {
            feedbackText.textContent = 'Ação desconhecida. Link inválido.';
        }
    }
}

// ===================================================================
//  LÓGICA DO PAINEL DO CLIENTE
// ===================================================================

// Variável global para armazenar todos os pedidos
let todosPedidos = [];
let notificacoesMap = {};

// Variáveis de paginação
let paginaAtual = 1;
const itensPorPagina = 20;
let pedidosFiltrados = [];


// Função para buscar e renderizar os dados do painel. Pode ser chamada múltiplas vezes para atualizar.
async function atualizarDadosPainel() {
    const sessionToken = localStorage.getItem("sessionToken");
    const pedidosListBody = document.getElementById("pedidos-list-body");
    const saldoValorEl = document.getElementById("saldo-valor");
    pedidosListBody.innerHTML = `<div class="loading-pedidos">Carregando seus pedidos...</div>`;

    if (!sessionToken) {
        localStorage.clear();
        window.location.href = "login";
        return;
    }

    try {
        const response = await fetch('/api/getPanelData', {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // Não precisa mais da chave x-make-apikey
    body: JSON.stringify({ token: sessionToken })
});
        
        // CORREÇÃO: Tentar fazer parse do JSON e capturar erro específico
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Se for erro de sessão, exibir alerta amigável
            if (detectarErroSessaoSubstituida(jsonError)) {
                exibirAlertaSessaoSubstituida();
                return;
            }
            throw jsonError;
        }
        
        if (!response.ok) { 
            if (await handleAuthError(response)) { 
                return; 
            } 
            throw new Error(data.message || "Erro ao buscar dados."); 
        }

        saldoValorEl.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.saldo || 0);

        // Armazenar todos os pedidos na variável global
        todosPedidos = data.pedidos || [];
        
        // Processa os dados de notificação para criar um mapa de fácil acesso (ID -> Status)
    if (data.notificacao && Array.isArray(data.notificacao)) {
        notificacoesMap = data.notificacao.reduce((mapa, item) => {
            const id = item["0"]; // Pega o ID do pedido
            const status = item["3"]; // Pega o status (Y/N)
            if (id) {
                mapa[id] = status;
            }
            return mapa;
        }, {});
    } else {
        notificacoesMap = {}; // Garante que o mapa esteja vazio se não houver notificações
    }
    
        // Resetar para a primeira página e aplicar filtros (que por sua vez chamará a renderização)
        paginaAtual = 1; 
        aplicarFiltros();

    } catch (error) {
        // CORREÇÃO: Detectar erro de sessão substituída também aqui
        if (detectarErroSessaoSubstituida(error)) {
            exibirAlertaSessaoSubstituida();
            return;
        }
        
        // Se não for erro de sessão, exibir erro normal
        pedidosListBody.innerHTML = `<div class="loading-pedidos" style="color: var(--erro);">${error.message}</div>`;
    }
}

// Função para renderizar os pedidos na tela com paginação
function renderizarPedidos(pedidos) {
    const pedidosListBody = document.getElementById("pedidos-list-body");
    const paginationContainer = document.getElementById("pagination-container");

    // CORREÇÃO: Limpar completamente o conteúdo antes de renderizar
    pedidosListBody.innerHTML = "";

    // Armazenar pedidos filtrados globalmente para uso na paginação
    pedidosFiltrados = pedidos;

    if (pedidos && pedidos.length > 0) {
        // Calcular índices para a página atual
        const indiceInicio = (paginaAtual - 1) * itensPorPagina;
        const indiceFim = indiceInicio + itensPorPagina;
        const pedidosPagina = pedidos.slice(indiceInicio, indiceFim);

        // CORREÇÃO: Construir todo o HTML de uma vez em vez de usar insertAdjacentHTML múltiplas vezes
        let pedidosHtml = "";

        // Renderizar apenas os pedidos da página atual
        pedidosPagina.forEach(pedido => {
            let statusInfo = { texto: "Desconhecido", classe: "" };
            // Verifica se há notificação e prepara o HTML do ícone
        let notificacaoHtml = ''; 
        if (notificacoesMap[pedido.ID] === 'Y') {
            // Usando o ícone "triangle-exclamation" que é mais parecido com um alerta
            notificacaoHtml = '<span class="notificacao-badge"><i class="fa-solid fa-circle"></i></span>';
        }

        // Monta o link do botão já com a notificação DENTRO dele
        let acaoHtml = `<a href="pedido?id=${pedido.ID}" class="btn-ver-pedido">Ver Detalhes${notificacaoHtml}</a>`;
            const stageId = pedido.STAGE_ID || "";

            // --- LÓGICA DE STATUS CORRIGIDA CONFORME SOLICITAÇÃO ---
            if (stageId === "NEW" || stageId === "C17:NEW") {
                statusInfo = { texto: "Aguardando Pagamento", classe: "status-pagamento" };
                acaoHtml = `<div class="dropdown-pagamento"><button class="btn-pagar" data-deal-id="${pedido.ID}">Pagar Agora</button><div class="dropdown-content"><button class="btn-pagar-saldo" data-deal-id="${pedido.ID}" data-valor="${(parseFloat(pedido.OPPORTUNITY) || 0).toFixed(2)}">Usar Saldo</button><button class="btn-gerar-cobranca" data-deal-id="${pedido.ID}">PIX</button></div></div>`;

            } else if (stageId === "LOSE") {
                statusInfo = { texto: "Cancelado", classe: "status-cancelado" };

            } else if (stageId === "C17:UC_2OEE24") {
                statusInfo = { texto: "Em Análise", classe: "status-analise" };

            } else if (
                stageId === "C17:PREPARATION" ||
                stageId === "C17:UC_Y31VM3" ||
                stageId === "C17:UC_HX3875" ||
                stageId === "C17:UC_EYLXL0"
            ) {
                statusInfo = { texto: "Em Andamento", classe: "status-andamento" };            } else if (stageId === "C17:1") {
                statusInfo = { texto: "Aprovado", classe: "status-aprovado" };

                } else if (stageId === "C17:WON" || stageId.includes("C19")) { // <-- MODIFICAÇÃO
                statusInfo = { texto: "Verificado", classe: "status-verificado" };

            } else if (stageId.includes("WON")) {
                statusInfo = { texto: "Aprovado", classe: "status-aprovado" };

            } else {
                // Status padrão para casos não mapeados
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

        // CORREÇÃO: Definir todo o HTML de uma vez para garantir que a delegação de eventos funcione
        pedidosListBody.innerHTML = pedidosHtml;

        // Mostrar controles de paginação se houver mais de uma página
        if (pedidos.length > itensPorPagina) {
            paginationContainer.classList.remove("hidden");
            atualizarControlesPaginacao(pedidos.length);
        } else {
            paginationContainer.classList.add("hidden");
        }

    } else {
        pedidosListBody.innerHTML = "<div class=\"loading-pedidos\" style=\"padding: 50px 20px;\">Nenhum pedido encontrado. Clique em \"+ Novo Pedido\" para começar!</div>";
        paginationContainer.classList.add("hidden");
    }
}

// Função para aplicar os filtros
function aplicarFiltros() {
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const statusSelected = statusFilter ? statusFilter.value : "todos";

    let pedidosFiltradosLocal = todosPedidos;

    // Filtro por texto (título ou ID)
    if (searchTerm) {
        pedidosFiltradosLocal = pedidosFiltradosLocal.filter(pedido => {
            const titulo = (pedido.TITLE || "").toLowerCase();
            const id = (pedido.ID || "").toString();
            return titulo.includes(searchTerm) || id.includes(searchTerm);
        });
    }

    // Filtro por status
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

    // Ao aplicar um novo filtro, sempre resetamos para a primeira página
    paginaAtual = 1;

    // Renderizar os pedidos filtrados (a função renderizarPedidos usa a variável global `pedidosFiltrados`)
    renderizarPedidos(pedidosFiltradosLocal);
}

// ===================================================================
//  FUNÇÕES DE PAGINAÇÃO
// ===================================================================

function irParaPagina(pagina) {
    const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaAtual = pagina;
        renderizarPedidos(pedidosFiltrados); // Re-renderiza a lista com a nova página
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

    if (paginaInicio > 1) {
        const btn1 = document.createElement("button");
        btn1.className = "pagination-page-btn";
        btn1.textContent = "1";
        btn1.addEventListener("click", () => irParaPagina(1));
        paginationPages.appendChild(btn1);
        if (paginaInicio > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.style.padding = "8px 4px";
            ellipsis.style.color = "#6c757d";
            paginationPages.appendChild(ellipsis);
        }
    }

    for (let i = paginaInicio; i <= paginaFim; i++) {
        const btn = document.createElement("button");
        btn.className = `pagination-page-btn ${i === paginaAtual ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener("click", () => irParaPagina(i));
        paginationPages.appendChild(btn);
    }

    if (paginaFim < totalPaginas) {
        if (paginaFim < totalPaginas - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.textContent = "...";
            ellipsis.style.padding = "8px 4px";
            ellipsis.style.color = "#6c757d";
            paginationPages.appendChild(ellipsis);
        }
        const btnLast = document.createElement("button");
        btnLast.className = "pagination-page-btn";
        btnLast.textContent = totalPaginas;
        btnLast.addEventListener("click", () => irParaPagina(totalPaginas));
        paginationPages.appendChild(btnLast);
    }
}


// Função para configurar todos os event listeners do painel. É chamada apenas uma vez.
function inicializarPainel() {
    const painelContent = document.body.querySelector(".main-painel");
    if (!painelContent) return;

    const sessionToken = localStorage.getItem("sessionToken");
    const userName = localStorage.getItem("userName");

    if (!sessionToken) {
        localStorage.clear();
        window.location.href = "login";
        return;
    }

    // Obter todos os elementos interativos
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
    const processingModal = document.getElementById("processing-modal");
    const processingModalContent = document.getElementById("processing-modal-content");
    const countdownTimerEl = document.getElementById("countdown-timer");
    let countdownInterval; // Variável para controlar o timer
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const btnFirstPage = document.getElementById("btn-first-page");
    const btnPrevPage = document.getElementById("btn-prev-page");
    const btnNextPage = document.getElementById("btn-next-page");
    const btnLastPage = document.getElementById("btn-last-page");
    

    // Event listener para o botão "Assistir Explicação"
    const btnAssistirExplicacao = document.getElementById('btn-assistir-explicacao');
    const videoContainer = document.getElementById('video-explicacao-container');
    
    if (btnAssistirExplicacao && videoContainer) {
        btnAssistirExplicacao.addEventListener('click', function() {
            if (videoContainer.classList.contains('hidden')) {
                videoContainer.classList.remove('hidden');
                this.textContent = 'Ocultar Explicação';
            } else {
                videoContainer.classList.add('hidden');
                this.textContent = 'Assistir Explicação';
            }
        });
    }

    // Configurar listeners que não dependem de dados
    userGreeting.textContent = `Olá, ${userName}!`;
    logoutButton.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login";
    });

    // Listeners dos Modais
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

    // Listener do Formulário de Adicionar Créditos
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
                    headers: { "Content-Type": "application/json", "x-make-apikey": FRONTEND_API_KEY },
                    body: JSON.stringify({ token: sessionToken, valor: valorAdicionado })
                });

                const data = await response.json();
                if (!response.ok) { if (await handleAuthError(response)) { return; } throw new Error(data.message || "Não foi possível gerar a cobrança."); }
                if (data.paymentLink) window.open(data.paymentLink, "_blank");
                
                modalCreditos.classList.remove("active");
                adquirirCreditosForm.reset();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda um pouco antes de atualizar
                await atualizarDadosPainel(); // Atualiza os dados do painel

            } catch (error) {
                showFeedback("creditos-form-error", error.message, true);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Pagar";
            }
        });
    }

    // Listener do Formulário de Novo Pedido - MODIFICADO PARA INCLUIR FORMATO DESEJADO E ARQUIVOS AUXILIARES
    novoPedidoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = novoPedidoForm.querySelector("button[type=\"submit\"]");
        
        // Validação do campo de link (se preenchido)
        const arquivosLink = document.getElementById("pedido-arquivos-link").value.trim();
        if (arquivosLink && !isValidURL(arquivosLink)) {
            showFeedback("pedido-form-error", "Por favor, insira um link válido para os arquivos auxiliares.", true);
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
            formato: document.getElementById("pedido-formato").value, // CAMPO FORMATO
            arquivos_link: arquivosLink // NOVO CAMPO ARQUIVOS AUXILIARES
        };

        try {
            const response = await fetch(CRIAR_PEDIDO_WEBHOOK_URL, { 
                method: "POST", 
                headers: { "Content-Type": "application/json", "x-make-apikey": FRONTEND_API_KEY }, 
                body: JSON.stringify(pedidoData) 
            });
            const data = await response.json();
            if (!response.ok) { if (await handleAuthError(response)) { return; } throw new Error(data.message || "Erro ao criar pedido."); }

            alert("Pedido criado! Ele aparecerá na sua lista como \"Aguardando Pagamento\".");
            modal.classList.remove("active");
            novoPedidoForm.reset();
            
            // CORREÇÃO: Chamar a função que SÓ atualiza os dados, sem adicionar novos listeners.
            await atualizarDadosPainel();

        } catch (error) {
            showFeedback("pedido-form-error", error.message, true);
        } finally {
             submitButton.disabled = false;
             submitButton.textContent = "Criar Pedido";
        }
    });

    // Listener para ações na lista de pedidos (delegação de evento)
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

        const row = target.closest('.pedido-item');
        const actionsCol = row.querySelector('.col-acoes');
        
        // 1. Salva o HTML original da coluna de ações para restaurar depois
        const originalActionsHTML = actionsCol.innerHTML;

        // 2. Inicia o feedback visual imediatamente
        row.classList.add('processing');
        let countdown = 30;
        actionsCol.innerHTML = `<div class="timer-display">Aguarde: ${countdown}s</div>`;
        
        // 3. Inicia o contador regressivo
        const countdownInterval = setInterval(() => {
            countdown--;
            actionsCol.innerHTML = `<div class="timer-display">Aguarde: ${countdown}s</div>`;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);

        // 4. "Dispara" a requisição e esquece (não usa await)
        fetch(PAGAR_COM_SALDO_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-make-apikey": FRONTEND_API_KEY },
            body: JSON.stringify({ token: sessionToken, dealId: dealId })
        })
        .then(response => response.json())
        .then(data => {
            // Log de sucesso ou erro no console, sem interferir na UI
            if (data.status === 'success') {
                console.log(`Pagamento do pedido #${dealId} processado em segundo plano.`);
            } else {
                console.error(`Erro no processamento do pedido #${dealId}:`, data.message);
            }
        })
        .catch(err => {
            console.error(`Falha na requisição de pagamento para o pedido #${dealId}:`, err);
        });
        
        // 5. Agenda a restauração da linha para daqui a 30 segundos
        setTimeout(() => {
            clearInterval(countdownInterval); // Garante que o timer pare
            row.classList.remove('processing');
            actionsCol.innerHTML = originalActionsHTML;
            // Opcional: Recarregar os dados do painel para refletir a mudança
            // atualizarDadosPainel(); // descomente se quiser que a lista atualize sozinha
        }, 30000);
    }
}

        if (target.classList.contains("btn-gerar-cobranca")) {
            target.textContent = "Gerando...";
            target.disabled = true;
            try {
                const response = await fetch(GERAR_COBRANCA_URL, { method: "POST", headers: { "Content-Type": "application/json", "x-make-apikey": FRONTEND_API_KEY }, body: JSON.stringify({ token: sessionToken, dealId: dealId }) });
                const data = await response.json();
                if (!response.ok) { if (await handleAuthError(response)) { return; } throw new Error(data.message); }
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

    // Listener para fechar o dropdown de pagamento ao clicar fora
    window.addEventListener("click", (e) => {
        if (!e.target.matches(".btn-pagar")) {
            document.querySelectorAll(".dropdown-pagamento.active").forEach(d => d.classList.remove("active"));
        }
    });
    
    // Listeners dos filtros
    if (searchInput) searchInput.addEventListener("input", aplicarFiltros);
    if (statusFilter) statusFilter.addEventListener("change", aplicarFiltros);
    
    // Listeners da paginação
    if (btnFirstPage) btnFirstPage.addEventListener("click", () => irParaPagina(1));
    if (btnPrevPage) btnPrevPage.addEventListener("click", () => irParaPagina(paginaAtual - 1));
    if (btnNextPage) btnNextPage.addEventListener("click", () => irParaPagina(paginaAtual + 1));
    if (btnLastPage) btnLastPage.addEventListener("click", () => {
        const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina);
        irParaPagina(totalPaginas);
    });

    // Carregar os dados pela primeira vez
    atualizarDadosPainel();
}


// Chamar a função de inicialização quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", inicializarPainel);





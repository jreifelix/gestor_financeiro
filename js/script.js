// script.js - Versão atualizada

// Variáveis globais
let financeData = {
    years: {},
    currentUser: "AMBOS", // Utilizador padrão
    currentYear: new Date().getFullYear()
};

let activeMonthByCategory = {};

let charts = {
    total: null,
    pprs: null,
    ativos: null,
    gastosCC: {}, // NOVO: Objeto para armazenar instâncias de gráficos de gastos por mês
    futuroTotal: null,
    futuroPprs: null,
    futuroAtivos: null
};

const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const mesesToPt = {
    'janeiro': 'Jan', 'fevereiro': 'Fev', 'março': 'Mar', 'abril': 'Abr', 
    'maio': 'Mai', 'junho': 'Jun', 'julho': 'Jul', 'agosto': 'Ago', 
    'setembro': 'Set', 'outubro': 'Out', 'novembro': 'Nov', 'dezembro': 'Dez'
};

const categorias = {
    'conta-corrente': 'Conta Corrente',
    'ativos': 'Ativos',
    'pprs': 'PPRs',
    'poupancas': 'Poupanças',
    'outros': 'Outros',
    'total': 'Total'
};

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initTema();
    initNavegacao();
    initEventos();
    carregarDados();
    initSeletorAno();
    initSeletorUtilizador();
    
    // Atualização inicial completa da UI
    atualizarUICompleta();
    mostrarSecao("dashboard");
});

function atualizarUICompleta() {
    atualizarSeletorAno();
    atualizarSeletorUtilizador();
    gerarInputsMensais();
    gerarInputsObjetivos();
    atualizarDashboard();
    atualizarTabelaAnual();

    atualizarGraficos();
    atualizarGraficosFuturo();
}

// --- INICIALIZAÇÃO E EVENTOS GERAIS ---

function initTema() {
    const botaoTema = document.getElementById('themeToggle');
    const temaAtual = localStorage.getItem('finance_theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', temaAtual);
    atualizarIconeTema(temaAtual);
    
    botaoTema.addEventListener('click', function() {
        const novoTema = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', novoTema);
        localStorage.setItem('finance_theme', novoTema);
        atualizarIconeTema(novoTema);
        mostrarToast(`Tema ${novoTema === 'dark' ? 'escuro' : 'claro'} ativado`, 'info');
    });
}

function atualizarIconeTema(tema) {
    const icone = document.querySelector('#themeToggle i');
    icone.className = tema === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initNavegacao() {
    document.querySelectorAll('.tab-btn').forEach(botao => {
        botao.addEventListener('click', () => mostrarSecao(botao.dataset.target));
    });
}

function initEventos() {
    document.getElementById('exportBtn').addEventListener('click', exportarDados);
    document.getElementById('importBtn').addEventListener('click', () => abrirModal('importModal'));
    document.getElementById("jsonFileInput").addEventListener("change", processarFicheiroJSON);
    document.getElementById("confirmImport").addEventListener("click", confirmarImportacao);
	
	document.getElementById('openRegisterModalBtn').addEventListener('click', abrirModalRegisto);
    document.getElementById('saveMonthDataBtn').addEventListener('click', guardarDadosDoModal);
	
	document.getElementById('exportAnnualSummaryBtn').addEventListener('click', exportarTabelaParaExcel);

    document.getElementById('openPrintModalBtn').addEventListener('click', abrirModalPrint);
    document.getElementById('generatePdfBtn').addEventListener('click', gerarRelatorioPDF);

}

function initSeletorAno() {
    const seletorAno = document.getElementById("yearSelector");
    seletorAno.addEventListener("change", alterarAno);
}

function initSeletorUtilizador() {
    const seletorUtilizador = document.getElementById("userSelector");
    seletorUtilizador.addEventListener("change", alterarUtilizador);
}


/**
 * [VERSÃO CORRIGIDA E FINAL]
 * Carrega os dados do localStorage e imediatamente repara e migra toda a estrutura de dados
 * para garantir que está em conformidade com a versão mais recente da aplicação.
 */
function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem('finance_data');
        if (dadosSalvos) {
            const parsedData = JSON.parse(dadosSalvos);
            
            // Carrega os dados como estão, mesmo que corrompidos.
            financeData.years = parsedData.years || {};
            financeData.currentYear = parsedData.currentYear || new Date().getFullYear();
            financeData.currentUser = parsedData.currentUser || "AMBOS";

            // --- LIMPEZA E MIGRAÇÃO CRÍTICA ---
            // Imediatamente após carregar, percorre TODOS os dados existentes e garante
            // que a sua estrutura está correta e migrada para o novo formato.
            // Isto previne que dados de versões antigas corrompam o estado da aplicação.
            Object.keys(financeData.years).forEach(year => {
                // Primeiro, remove as chaves de categoria que foram criadas erradamente ao nível do ano.
                ['conta-corrente', 'ativos', 'pprs', 'poupancas', 'outros', 'objectives'].forEach(cat => {
                    if (financeData.years[year][cat]) {
                        delete financeData.years[year][cat];
                    }
                });

                // Depois, garante que a estrutura para cada utilizador está correta.
                Object.keys(financeData.years[year]).forEach(user => {
                    if (user === "JORGE" || user === "RITA" || user === "AMBOS") {
                        garantirEstruturaDados(parseInt(year), user);
                    }
                });
            });
            // --- FIM DA LIMPEZA E MIGRAÇÃO ---

        } else {
            // Se não houver dados salvos, inicializa do zero com a estrutura correta.
            inicializarDados();
        }
        
        // Garante que a estrutura para o ano/utilizador ATUAL existe, caso seja um novo ano.
        garantirEstruturaDados(financeData.currentYear, financeData.currentUser);

    } catch (error) {
        console.error('Erro fatal ao carregar ou reparar dados:', error);
        mostrarToast('Erro ao carregar dados. A inicializar do zero.', 'error');
        // Se ocorrer um erro irrecuperável, inicializa a aplicação do zero.
        inicializarDados();
    }
    
    // Salva os dados imediatamente após a limpeza e migração.
    salvarDados();
}


function salvarDados() {
    try {
        localStorage.setItem('finance_data', JSON.stringify(financeData));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        mostrarToast('Erro ao salvar dados', 'error');
    }
}


function inicializarDados() {
    const currentYear = new Date().getFullYear();
    // Define o objeto financeData raiz.
    financeData = {
        years: {},
        currentUser: "AMBOS",
        currentYear: currentYear
    };
    
    // Cria o objeto para o ano corrente. É a única vez que uma chave é adicionada a 'years'.
    financeData.years[currentYear] = {};

    // Itera sobre os utilizadores e chama a função que cria a estrutura DENTRO do ano.
    ["JORGE", "RITA", "AMBOS"].forEach(user => {
        inicializarDadosUtilizadorAno(currentYear, user);
    });
}



function inicializarDadosAno(year) {
    if (!financeData.years[year]) {
        financeData.years[year] = {};
    }
    ["JORGE", "RITA", "AMBOS"].forEach(user => {
        inicializarDadosUtilizadorAno(year, user);
    });
}


// script.js - Substituir a função inicializarDadosUtilizadorAno

/**
 * [VERSÃO CORRIGIDA]
 * Inicializa a estrutura de dados completa para um utilizador específico dentro de um ano.
 * Garante que a hierarquia Ano -> Utilizador -> Categoria -> Mês é criada corretamente.
 * @param {number} year - O ano para o qual os dados serão inicializados.
 * @param {string} user - O nome do utilizador (JORGE, RITA, ou AMBOS).
 */
function inicializarDadosUtilizadorAno(year, user) {
    // Garante que o objeto do ano existe.
    if (!financeData.years[year]) {
        financeData.years[year] = {};
    }

    // --- CORREÇÃO PRINCIPAL ---
    // Cria o objeto para o utilizador específico DENTRO do ano, se ainda não existir.
    if (!financeData.years[year][user]) {
        financeData.years[year][user] = {};
    }

    // Define a estrutura de categorias DENTRO do objeto do utilizador.
    const userData = financeData.years[year][user];

    // Lista de todas as categorias de dados e a de objetivos.
    const allCategories = ['conta-corrente', 'ativos', 'pprs', 'poupancas', 'outros'];
    const objectiveCategory = 'objectives';

    // Inicializa cada categoria de dados.
    allCategories.forEach(categoria => {
        // Só inicializa se a categoria ainda não existir para este utilizador.
        if (!userData[categoria]) {
            userData[categoria] = {};
            meses.forEach(mes => {
                if (categoria === 'conta-corrente') {
                    userData[categoria][mes] = { 
                        ganhos: 0, 
                        gastos: { essenciais: 0, poupancas: 0, desejos: 0 } 
                    };
                } else {
                    userData[categoria][mes] = 0;
                }
            });
        }
    });

    // Inicializa a categoria de objetivos.
    if (!userData[objectiveCategory]) {
        userData[objectiveCategory] = {};
        allCategories.forEach(categoria => {
            // O valor inicial para cada objetivo de categoria é 0.
            userData[objectiveCategory][categoria] = 0;
        });
    }
}


/**
 * [VERSÃO FINAL E CORRIGIDA]
 * Garante que a estrutura de dados completa para um determinado ano e utilizador existe.
 * Esta função é "idempotente": pode ser chamada múltiplas vezes sem causar efeitos secundários.
 * Se a estrutura não existir, ela é criada.
 * Se for uma estrutura antiga (pré-v3.0), ela é migrada para o formato mais recente.
 * @param {number} year - O ano a verificar.
 * @param {string} user - O utilizador a verificar.
 */
function garantirEstruturaDados(year, user) {
    // Garante que o objeto do ano e do utilizador existem.
    if (!financeData.years[year]) {
        financeData.years[year] = {};
    }
    if (!financeData.years[year][user]) {
        inicializarDadosUtilizadorAno(year, user);
        return; // Se inicializou do zero, a estrutura está garantidamente correta.
    }

    const userData = financeData.years[year][user];
    const allCategories = ['conta-corrente', 'ativos', 'pprs', 'poupancas', 'outros'];

    // Itera sobre TODAS as categorias para garantir que existem.
    allCategories.forEach(categoria => {
        if (!userData[categoria]) {
            // Se uma categoria inteira falta, recria-a.
            userData[categoria] = {};
            meses.forEach(mes => {
                if (categoria === 'conta-corrente') {
                    userData[categoria][mes] = { ganhos: 0, gastos: { essenciais: 0, poupancas: 0, desejos: 0 } };
                } else {
                    userData[categoria][mes] = 0;
                }
            });
        } else if (categoria === 'conta-corrente') {
            // Se a categoria é 'conta-corrente', faz uma verificação mais profunda da sua sub-estrutura.
            meses.forEach(mes => {
                const ccData = userData[categoria][mes];
                // Verifica e migra a sub-estrutura de 'gastos' se for um formato antigo.
                if (!ccData || typeof ccData.gastos !== 'object' || ccData.gastos === null || !('essenciais' in ccData.gastos)) {
                    const oldGastosValue = (typeof ccData === 'object' && ccData !== null && 'gastos' in ccData) ? (ccData.gastos || 0) : 0;
                    const oldGanhosValue = (typeof ccData === 'object' && ccData !== null && 'ganhos' in ccData) ? (ccData.ganhos || 0) : 0;
                    
                    userData[categoria][mes] = { 
                        ganhos: oldGanhosValue,
                        gastos: { 
                            essenciais: oldGastosValue, // Assume que o valor antigo de gastos era para 'essenciais'.
                            poupancas: 0, 
                            desejos: 0 
                        } 
                    };
                }
            });
        }
    });

    // Garante que a secção de objetivos existe.
    if (!userData.objectives) {
        userData.objectives = {};
        allCategories.forEach(cat => {
            userData.objectives[cat] = 0;
        });
    }
}


// --- MANIPULAÇÃO DA UI ---

function mostrarSecao(idSecao) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(idSecao)?.classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.target === idSecao);
    });

    if (idSecao === "resumo-anual") {
        atualizarTabelaAnual();
    } else if (idSecao === "graficos") {
        atualizarGraficos();
	    } else if (idSecao === "futuro") { // <-- NOVA CONDIÇÃO
        atualizarGraficosFuturo();
    }
}

function alterarAno() {
    financeData.currentYear = parseInt(document.getElementById('yearSelector').value);
    garantirEstruturaDados(financeData.currentYear, financeData.currentUser);
    atualizarUICompleta();
    salvarDados();
    mostrarToast(`Ano alterado para ${financeData.currentYear}`, 'info');
	
	mostrarSecao('dashboard'); 
}

function alterarUtilizador() {
    financeData.currentUser = document.getElementById("userSelector").value;
    garantirEstruturaDados(financeData.currentYear, financeData.currentUser);
    atualizarUICompleta();
    salvarDados();
    mostrarToast(`Utilizador alterado para ${financeData.currentUser}`, 'info');
	
	mostrarSecao('dashboard'); 
}

function atualizarSeletorAno() {
    const seletor = document.getElementById("yearSelector");
    seletor.innerHTML = "";
    for (let ano = 2021; ano <= 2031; ano++) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        option.selected = (ano === financeData.currentYear);
        seletor.appendChild(option);
    }
}

function atualizarSeletorUtilizador() {
    const seletor = document.getElementById("userSelector");
    seletor.innerHTML = "";
    ["JORGE", "RITA", "AMBOS"].forEach(user => {
        const option = document.createElement("option");
        option.value = user;
        option.textContent = user;
        option.selected = (user === financeData.currentUser);
        seletor.appendChild(option);
    });
}

/**
 * [VERSÃO FINAL COM LAYOUT LADO A LADO]
 * Gera dinamicamente os cards de input mensais para cada categoria.
 * Para a Conta Corrente, cria um layout com o formulário à esquerda e o gráfico à direita.
 * Para as outras categorias, inclui um campo de valor único.
 * Implementa a navegação entre os meses e a atualização dinâmica dos gráficos.
 */
function gerarInputsMensais() {
    const { currentYear, currentUser } = financeData;

    Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
        const cardsContainer = document.getElementById(`${categoria}-cards`);
        const navContainer = document.getElementById(`${categoria}-nav`);
        if (!cardsContainer || !navContainer) return;

        cardsContainer.innerHTML = '';
        
        const today = new Date();
        const realCurrentYear = today.getFullYear();
        const realCurrentMonth = today.getMonth();

        let activeMonthIndex;
        if (currentYear === realCurrentYear) {
            activeMonthIndex = realCurrentMonth;
        } else if (activeMonthByCategory[categoria] !== undefined) {
            activeMonthIndex = activeMonthByCategory[categoria];
        } else {
            activeMonthIndex = 0;
        }
        activeMonthByCategory[categoria] = activeMonthIndex;

        meses.forEach((mes, index) => {
            const mesCapitalized = mes.charAt(0).toUpperCase() + mes.slice(1);
            const card = document.createElement('div');
            card.className = 'month-card';
            card.id = `${categoria}-${mes}-card`;
            if (index === activeMonthIndex) {
                card.classList.add('active');
            }

            let contentHTML = '';
            // --- BLOCO ALTERADO PARA O NOVO LAYOUT ---
            if (categoria === 'conta-corrente') {
                const valores = financeData.years[currentYear]?.[currentUser]?.[categoria]?.[mes] || { ganhos: 0, gastos: { essenciais: 0, poupancas: 0, desejos: 0 } };
                const totalGastos = (valores.gastos.essenciais || 0) + (valores.gastos.poupancas || 0) + (valores.gastos.desejos || 0);
                const totalMes = valores.ganhos - totalGastos;

                contentHTML = `
                    <div class="cc-layout">
                        <div class="cc-form">
                            <div class="input-wrapper ganhos">
                                <label class="input-label">Ganhos</label>
                                <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valores.ganhos}" id="cc-${mes}-ganhos">
                            </div>
                            <div class="input-wrapper gastos">
                                <label class="input-label">Gastos Essenciais</label>
                                <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valores.gastos.essenciais}" id="cc-${mes}-gastos-essenciais">
                            </div>
                            <div class="input-wrapper gastos">
                                <label class="input-label">Gastos Poupanças</label>
                                <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valores.gastos.poupancas}" id="cc-${mes}-gastos-poupancas">
                            </div>
                            <div class="input-wrapper gastos">
                                <label class="input-label">Gastos Desejos</label>
                                <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valores.gastos.desejos}" id="cc-${mes}-gastos-desejos">
                            </div>
                            <div class="total-mes-cc" id="cc-total-${mes}">Total Líquido: ${formatarMoeda(totalMes)}</div>
                        </div>
                        <div class="cc-chart">
                            <div class="chart-container-small">
                                <canvas id="chart-gastos-cc-${mes}" class="chart-canvas-small"></canvas>
                            </div>
                        </div>
                    </div>
                `;
            } 
            // --- O BLOCO ELSE PERMANECE IGUAL ---
            else {
                const valor = financeData.years[currentYear]?.[currentUser]?.[categoria]?.[mes] || 0;
                contentHTML = `
                    <div class="input-wrapper">
                        <label class="input-label">Valor</label>
                        <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valor}" id="${categoria}-${mes}">
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="month-card-header">
                    <h3><i class="fas fa-calendar-day"></i> ${mesCapitalized}</h3>
                    <div class="input-variation" id="${categoria}-${mes}-variation"></div>
                </div>
                <div class="month-card-content">
                    ${contentHTML}
                </div>
            `;
            cardsContainer.appendChild(card);

            // Adiciona os event listeners para os inputs
            if (categoria === 'conta-corrente') {
                const updateCCTotal = () => {
                    const ganhos = parseFloat(document.getElementById(`cc-${mes}-ganhos`).value) || 0;
                    const gastosEssenciais = parseFloat(document.getElementById(`cc-${mes}-gastos-essenciais`).value) || 0;
                    const gastosPoupancas = parseFloat(document.getElementById(`cc-${mes}-gastos-poupancas`).value) || 0;
                    const gastosDesejos = parseFloat(document.getElementById(`cc-${mes}-gastos-desejos`).value) || 0;
                    
                    financeData.years[currentYear][currentUser][categoria][mes] = { 
                        ganhos: ganhos, 
                        gastos: { 
                            essenciais: gastosEssenciais, 
                            poupancas: gastosPoupancas, 
                            desejos: gastosDesejos 
                        } 
                    };
                    const totalLiquido = ganhos - (gastosEssenciais + gastosPoupancas + gastosDesejos);
                    document.getElementById(`cc-total-${mes}`).textContent = `Total Líquido: ${formatarMoeda(totalLiquido)}`;
                    
                    atualizarVariacao(categoria, mes);
                    atualizarDashboard();
                    atualizarTabelaAnual();
                    atualizarProgressoObjetivo('conta-corrente'); 
                    
                    criarOuAtualizarGraficoGastosCC(mes, currentYear, currentUser, `chart-gastos-cc-${mes}`);

                    salvarDados();
					
					
                };
                document.getElementById(`cc-${mes}-ganhos`).addEventListener('input', updateCCTotal);
                document.getElementById(`cc-${mes}-gastos-essenciais`).addEventListener('input', updateCCTotal);
                document.getElementById(`cc-${mes}-gastos-poupancas`).addEventListener('input', updateCCTotal);
                document.getElementById(`cc-${mes}-gastos-desejos`).addEventListener('input', updateCCTotal);

            } else {
                document.getElementById(`${categoria}-${mes}`).addEventListener('input', function() {
                    financeData.years[currentYear][currentUser][categoria][mes] = parseFloat(this.value) || 0;
                    
                    atualizarVariacao(categoria, mes);
                    atualizarDashboard();
                    atualizarTabelaAnual();
                    atualizarGraficos();
                    
                    salvarDados();
                });
            }
        });

        const monthDisplay = navContainer.querySelector('.current-month-display');
        const prevButton = navContainer.querySelector('.prev-month');
        const nextButton = navContainer.querySelector('.next-month');

        const updateMonthView = () => {
            monthDisplay.textContent = meses[activeMonthIndex].charAt(0).toUpperCase() + meses[activeMonthIndex].slice(1);
            cardsContainer.querySelectorAll('.month-card').forEach((card, index) => {
                const isActive = index === activeMonthIndex;
                card.classList.toggle('active', isActive);
                
				if (isActive && categoria === 'conta-corrente') {
					criarOuAtualizarGraficoGastosCC(meses[index], currentYear, currentUser, `chart-gastos-cc-${meses[index]}`);
				}
            });
            prevButton.disabled = activeMonthIndex === 0;
            nextButton.disabled = activeMonthIndex === 11;
            activeMonthByCategory[categoria] = activeMonthIndex;
        };

        prevButton.onclick = () => {
            if (activeMonthIndex > 0) {
                activeMonthIndex--;
                updateMonthView();
            }
        };

        nextButton.onclick = () => {
            if (activeMonthIndex < 11) {
                activeMonthIndex++;
                updateMonthView();
            }
        };

        updateMonthView();
        meses.forEach(mes => atualizarVariacao(categoria, mes));
    });
}




function gerarInputsObjetivos() {
    const container = document.getElementById('objetivos-inputs');
    const { currentYear, currentUser } = financeData;
    if (!container) return;

    container.innerHTML = `<div class="year-indicator"><h3><i class="fas fa-calendar-year"></i> Objetivos para ${currentYear} (${currentUser})</h3></div>`;
    
    Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
        const valor = financeData.years[currentYear]?.[currentUser]?.objectives?.[categoria] || 0;
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.innerHTML = `
            <label class="input-label"><i class="fas fa-bullseye"></i> Objetivo ${categorias[categoria]}</label>
            <input type="number" step="0.01" min="0" class="input-field" placeholder="0,00" value="${valor}" id="objetivo-${categoria}">
            <div class="progress-indicator" id="progress-${categoria}"></div>
        `;
        container.appendChild(inputGroup);

        inputGroup.querySelector('input').addEventListener('input', function() {
            financeData.years[currentYear][currentUser].objectives[categoria] = parseFloat(this.value) || 0;
            atualizarProgressoObjetivo(categoria);
            atualizarDashboard();
            salvarDados();
        });
        atualizarProgressoObjetivo(categoria);
    });
}

// --- ATUALIZAÇÃO DE COMPONENTES ---

function atualizarDashboard() {
    const { currentYear, currentUser } = financeData;
    let totalGeralAtual = 0;

    Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
        const ultimoValor = obterUltimoValorPreenchido(currentYear, currentUser, categoria);
        totalGeralAtual += ultimoValor;

        document.getElementById(`summary-${categoria}`).textContent = formatarMoeda(ultimoValor);
        
        const objetivo = financeData.years[currentYear]?.[currentUser]?.objectives?.[categoria] || 0;
        const variacaoEl = document.getElementById(`variation-${categoria}`);
        if (objetivo > 0) {
            const percentagem = (ultimoValor / objetivo) * 100;
            variacaoEl.innerHTML = `<span class="variation-text ${getClasseVariacao(percentagem - 100)}">${percentagem.toFixed(1)}%</span>`;
        } else {
            variacaoEl.innerHTML = `<span class="variation-text variation-neutral">N/A</span>`;
        }
    });

    document.getElementById('summary-total').textContent = formatarMoeda(totalGeralAtual);
    
    const objetivoTotal = Object.values(financeData.years[currentYear]?.[currentUser]?.objectives || {}).reduce((a, b) => a + b, 0);
    const variacaoTotalEl = document.getElementById('variation-total');
    if (objetivoTotal > 0) {
        const percentagemTotal = (totalGeralAtual / objetivoTotal) * 100;
        variacaoTotalEl.innerHTML = `<span class="variation-text ${getClasseVariacao(percentagemTotal - 100)}">${percentagemTotal.toFixed(1)}%</span>`;
    } else {
        variacaoTotalEl.innerHTML = `<span class="variation-text variation-neutral">N/A</span>`;
    }
}

function atualizarTabelaAnual() {
    const tabelaCorpo = document.getElementById("annual-summary-body");
    if (!tabelaCorpo) return;

    const { currentYear, currentUser } = financeData;
    tabelaCorpo.innerHTML = '';

    Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
        const linha = document.createElement('tr');
        linha.innerHTML = `<th>${categorias[categoria]}</th>`;
        meses.forEach(mes => {
            const valor = obterValorMes(currentYear, currentUser, categoria, mes);
            linha.innerHTML += `<td class="currency">${formatarMoeda(valor)}</td>`;
        });
        tabelaCorpo.appendChild(linha);
    });

    const linhaTotal = document.createElement('tr');
    linhaTotal.className = 'total-row';
    linhaTotal.innerHTML = `<th>Total</th>`;
    meses.forEach(mes => {
        let totalMes = 0;
        Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
            totalMes += obterValorMes(currentYear, currentUser, categoria, mes);
        });
        linhaTotal.innerHTML += `<td class="currency">${formatarMoeda(totalMes)}</td>`;
    });
    tabelaCorpo.appendChild(linhaTotal);
}

function atualizarVariacao(categoria, mes) {
    const { currentYear, currentUser } = financeData;
    const mesIndex = meses.indexOf(mes);
    
    const valorAtual = obterValorMes(currentYear, currentUser, categoria, mes);
    let valorAnterior = 0;

    if (mesIndex > 0) {
        valorAnterior = obterValorMes(currentYear, currentUser, categoria, meses[mesIndex - 1]);
    } else { // Janeiro, buscar Dezembro do ano anterior
        const anoAnterior = currentYear - 1;
        valorAnterior = obterValorMes(anoAnterior, currentUser, categoria, 'dezembro');
    }
    
    const variacao = calcularVariacaoPercentual(valorAtual, valorAnterior);
    const elementoVariacao = document.getElementById(`${categoria}-${mes}-variation`);
    if (elementoVariacao) {
        elementoVariacao.innerHTML = `<span class="variation-text ${getClasseVariacao(variacao)}">${formatarVariacao(variacao)}</span>`;
    }
}

function atualizarProgressoObjetivo(categoria) {
    const { currentYear, currentUser } = financeData;
    const progressElement = document.getElementById(`progress-${categoria}`);
    if (!progressElement) return;

    const objetivo = financeData.years[currentYear]?.[currentUser]?.objectives?.[categoria] || 0;
    const ultimoValor = obterUltimoValorPreenchido(currentYear, currentUser, categoria);

    if (objetivo > 0) {
        const percentagem = (ultimoValor / objetivo) * 100;
        progressElement.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill ${getClasseProgresso(percentagem)}" style="width: ${Math.min(percentagem, 100)}%"></div>
            </div>
            <div class="progress-text">${formatarMoeda(ultimoValor)} / ${formatarMoeda(objetivo)} (${percentagem.toFixed(1)}%)</div>
        `;
    } else {
        progressElement.innerHTML = `<div class="progress-text">Defina um objetivo</div>`;
    }
}

// --- GRÁFICOS ---

function atualizarGraficos() {
    const { currentUser } = financeData;
    const anos = Array.from({length: 11}, (_, i) => 2021 + i);
    
    const dadosTotal = anos.map(ano => {
        let total = 0;
        Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
            total += obterUltimoValorPreenchido(ano, currentUser, categoria);
        });
        return total;
    });

    const dadosPPRs = anos.map(ano => obterUltimoValorPreenchido(ano, currentUser, 'pprs'));
    const dadosAtivos = anos.map(ano => obterUltimoValorPreenchido(ano, currentUser, 'ativos'));

    criarOuAtualizarGrafico('chart-total', 'Total', anos, dadosTotal, '#2563eb');
    criarOuAtualizarGrafico('chart-pprs', 'PPRs', anos, dadosPPRs, '#dc2626');
    criarOuAtualizarGrafico('chart-ativos', 'Ativos', anos, dadosAtivos, '#16a34a');
}

function criarOuAtualizarGrafico(canvasId, label, labels, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (charts[canvasId.replace('chart-', '')]) {
        charts[canvasId.replace('chart-', '')].destroy();
    }

    charts[canvasId.replace('chart-', '')] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => formatarMoeda(value) }
                }
            },
            elements: { point: { radius: 6, hoverRadius: 8 } }
        }
    });
}

// --- FUNÇÕES AUXILIARES ---

// script.js - Localize a função obterValorMes e altere-a

function obterValorMes(year, user, categoria, mes) {
    const data = financeData.years[year]?.[user]?.[categoria]?.[mes];
    if (categoria === 'conta-corrente') {
        const ganhos = data?.ganhos || 0;
        // SOMA DOS NOVOS GASTOS
        const gastosEssenciais = data?.gastos?.essenciais || 0;
        const gastosPoupancas = data?.gastos?.poupancas || 0;
        const gastosDesejos = data?.gastos?.desejos || 0;
        return ganhos - (gastosEssenciais + gastosPoupancas + gastosDesejos);
    }
    return data || 0;
}


function obterUltimoValorPreenchido(year, user, categoria) {
    garantirEstruturaDados(year, user);
    for (let i = meses.length - 1; i >= 0; i--) {
        const valor = obterValorMes(year, user, categoria, meses[i]);
        
        // Se for conta corrente, verificamos se houve alguma entrada de ganhos ou qualquer tipo de gasto
        if (categoria === 'conta-corrente') {
            const ccData = financeData.years[year]?.[user]?.[categoria]?.[meses[i]];
            if ((ccData?.ganhos || 0) > 0 || 
                (ccData?.gastos?.essenciais || 0) > 0 || 
                (ccData?.gastos?.poupancas || 0) > 0 || 
                (ccData?.gastos?.desejos || 0) > 0) {
                return valor;
            }
        } else if (valor > 0) { // Para outras categorias, o valor > 0 ainda é válido
            return valor;
        }
    }
    return 0;
}


function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(valor);
}

function calcularVariacaoPercentual(valorAtual, valorAnterior) {
    if (valorAnterior === 0) return valorAtual > 0 ? 100 : (valorAtual < 0 ? -100 : 0);
    return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
}

function formatarVariacao(variacao) {
    const sinal = variacao >= 0 ? '+' : '';
    return `${sinal}${variacao.toFixed(1)}%`;
}

function getClasseVariacao(variacao) {
    if (variacao > 0) return 'variation-positive';
    if (variacao < 0) return 'variation-negative';
    return 'variation-neutral';
}

function getClasseProgresso(percentagem) {
    if (percentagem >= 100) return 'progress-complete';
    if (percentagem >= 75) return 'progress-good';
    if (percentagem >= 50) return 'progress-medium';
    return 'progress-low';
}


/**
 * [VERSÃO CORRIGIDA E FINAL]
 * Exporta os dados financeiros para um ficheiro JSON limpo e bem estruturado,
 * preservando a estrutura de dados completa, incluindo os gastos detalhados.
 */
function exportarDados() {
    try {
        // Garante que todos os dados em memória estão na estrutura mais recente antes de exportar.
        // Esta é uma boa prática para garantir a consistência dos dados.
        Object.keys(financeData.years).forEach(year => {
            Object.keys(financeData.years[year]).forEach(user => {
                // Verifica se a chave é um utilizador válido para evitar processar dados corrompidos.
                if (user === "JORGE" || user === "RITA" || user === "AMBOS") {
                    garantirEstruturaDados(parseInt(year), user);
                }
            });
        });

        // --- CORREÇÃO PRINCIPAL AQUI ---
        // Em vez de tentar reconstruir o objeto, simplesmente usamos a estrutura existente
        // que já está correta na variável `financeData`.
        // Criamos um objeto para exportação que contém o estado completo da aplicação.
        const dadosParaExportar = {
            years: financeData.years,
            currentUser: financeData.currentUser,
            currentYear: financeData.currentYear
        };

        const dadosExportacaoFinal = {
            meta: {
                version: '4.0', // Versão que representa a estrutura de gastos detalhada.
                exportDate: new Date().toISOString(),
                appName: 'Gestor Financeiro'
            },
            // Usamos o objeto de dados completo.
            data: dadosParaExportar 
        };
        
        const blob = new Blob([JSON.stringify(dadosExportacaoFinal, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `gestor-financeiro-backup-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        mostrarToast('Erro ao exportar dados', 'error');
    }
}


function processarFicheiroJSON(event) {
    const ficheiro = event.target.files[0];
    if (!ficheiro) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            document.getElementById('previewContent').textContent = JSON.stringify(dados, null, 2);
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('confirmImport').disabled = false;
            document.getElementById('confirmImport').onclick = () => confirmarImportacao(dados);
        } catch (error) {
            mostrarToast('Ficheiro JSON inválido', 'error');
            document.getElementById('importPreview').style.display = 'none';
            document.getElementById('confirmImport').disabled = true;
        }
    };
    reader.readAsText(ficheiro);
}


/**
 * [VERSÃO MELHORADA]
 * Confirma a importação de um ficheiro JSON, detetando diferentes versões de formato.
 * Após a importação, força a verificação e migração de toda a estrutura de dados.
 */
function confirmarImportacao(dados) {
    try {
        let dadosFinanceiros;

        // Verifica se o ficheiro tem a nova estrutura (com meta e data)
        if (dados.meta && dados.data && dados.data.years) {
            dadosFinanceiros = dados.data;
            console.log(`A importar ficheiro versão ${dados.meta.version || 'desconhecida'}`);
        } 
        // Verifica se é um ficheiro antigo (só com a chave 'years' no topo)
        else if (dados.years) {
            dadosFinanceiros = dados;
            console.log("A importar ficheiro de versão antiga (pré 2.0). A estrutura será migrada.");
        } 
        // Se a estrutura for completamente desconhecida, lança um erro.
        else {
            // throw new Error('Estrutura de dados do ficheiro JSON é inválida ou não reconhecida.');
            throw new Error('A');
        }

        // Atribui os dados importados à variável global.
        financeData = {
            years: dadosFinanceiros.years || {},
            currentUser: dadosFinanceiros.currentUser || "AMBOS",
            currentYear: dadosFinanceiros.currentYear || new Date().getFullYear()
        };
        
        // Após importar, percorre TODOS os dados e garante que estão na estrutura mais recente.
        // Isto é crucial para migrar dados de versões antigas para a nova estrutura.
        Object.keys(financeData.years).forEach(year => {
            Object.keys(financeData.years[year]).forEach(user => {
                if (user === "JORGE" || user === "RITA" || user === "AMBOS") {
                    garantirEstruturaDados(parseInt(year), user);
                }
            });
        });

        salvarDados();
        atualizarUICompleta();
        fecharModal('importModal');
        mostrarToast('Dados importados e migrados com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao importar dados:', error);
		//mostrarToast(`Erro ao importar: ${error.message}`, 'error');

    }
}




function abrirModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'importModal') {
        document.getElementById('jsonFileInput').value = '';
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('confirmImport').disabled = true;
    }
}

function mostrarToast(mensagem, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.error('Elemento #toast-container não encontrado no DOM.');
        return;
    }

    // Cria o elemento do toast
    const toast = document.createElement('div');
    
    // --- A CORREÇÃO CRÍTICA ESTÁ AQUI ---
    // Adiciona a classe base 'toast' e a classe de tipo (ex: 'success')
    // Usar classList.add é a forma mais segura de adicionar múltiplas classes.
    toast.classList.add('toast', `toast-${tipo}`);
    // --- FIM DA CORREÇÃO ---
    
    // Define o ícone com base no tipo
    const icones = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    // Define o HTML interno do toast
    toast.innerHTML = `
        <i class="${icones[tipo]}"></i>
        <span>${mensagem}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adiciona o toast ao container
    container.appendChild(toast);
    
    // Define um temporizador para remover o toast automaticamente após 2,5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 2500);
}

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});


/**
 * Abre e pré-preenche o modal de registo rápido.
 */
function abrirModalRegisto() {
    const { currentUser, currentYear } = financeData;
    const today = new Date();
    const currentMonthIndex = today.getMonth(); // 0-11

    // Preencher seletor de utilizador
    const userSelector = document.getElementById('modalUserSelector');
    userSelector.innerHTML = '';
    ["JORGE", "RITA", "AMBOS"].forEach(user => {
        const option = document.createElement("option");
        option.value = user;
        option.textContent = user;
        option.selected = (user === currentUser);
        userSelector.appendChild(option);
    });

    // Preencher seletor de ano
    const yearSelector = document.getElementById('modalYearSelector');
    yearSelector.innerHTML = '';
    for (let ano = 2021; ano <= 2031; ano++) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        option.selected = (ano === currentYear);
        yearSelector.appendChild(option);
    }

    // Preencher seletor de mês
    const monthSelector = document.getElementById('modalMonthSelector');
    monthSelector.innerHTML = '';
    meses.forEach((mes, index) => {
        const option = document.createElement("option");
        option.value = mes;
        option.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        option.selected = (index === currentMonthIndex);
        monthSelector.appendChild(option);
    });

    // Limpar todos os campos de input
    document.getElementById('registerMonthForm').reset();

    // Abrir o modal
    abrirModal('registerMonthModal');
}

/**
 * Guarda os dados inseridos no modal de registo rápido.
 */

function guardarDadosDoModal() {
    const user = document.getElementById('modalUserSelector').value;
    const year = parseInt(document.getElementById('modalYearSelector').value);
    const month = document.getElementById('modalMonthSelector').value;

    garantirEstruturaDados(year, user);

    const ganhos = parseFloat(document.getElementById('modalGanhos').value) || 0;
    // NOVOS CAMPOS DE GASTOS
    const gastosEssenciais = parseFloat(document.getElementById('modalGastosEssenciais').value) || 0;
    const gastosPoupancas = parseFloat(document.getElementById('modalGastosPoupancas').value) || 0;
    const gastosDesejos = parseFloat(document.getElementById('modalGastosDesejos').value) || 0;

    const ativos = parseFloat(document.getElementById('modalAtivos').value) || 0;
    const pprs = parseFloat(document.getElementById('modalPPRs').value) || 0;
    const poupancas = parseFloat(document.getElementById('modalPoupancas').value) || 0;
    const outros = parseFloat(document.getElementById('modalOutros').value) || 0;

    // Atualizar a estrutura de dados global (financeData)
    financeData.years[year][user]['conta-corrente'][month] = { 
        ganhos: ganhos, 
        gastos: { 
            essenciais: gastosEssenciais, 
            poupancas: gastosPoupancas, 
            desejos: gastosDesejos 
        } 
    };
    financeData.years[year][user]['ativos'][month] = ativos;
    financeData.years[year][user]['pprs'][month] = pprs;
    financeData.years[year][user]['poupancas'][month] = poupancas;
    financeData.years[year][user]['outros'][month] = outros;

    salvarDados();
    atualizarUICompleta();
	
	atualizarGraficos();
	

    fecharModal('registerMonthModal');
    mostrarToast(`Dados de ${month} de ${year} guardados com sucesso!`, 'success');
}


/**
 * [VERSÃO CORRIGIDA E FINAL]
 * Cria ou atualiza o gráfico circular de gastos da Conta Corrente para um mês específico.
 * Garante que o gráfico é exibido e atualizado mesmo quando os valores passam de 0 para >0.
 * @param {string} mes - O nome do mês (ex: 'janeiro').
 * @param {number} year - O ano.
 * @param {string} user - O utilizador.
 */
/**
 * [VERSÃO FLEXÍVEL]
 * Cria ou atualiza um gráfico circular de gastos da Conta Corrente num canvas específico.
 * @param {string} mes - O nome do mês.
 * @param {number} year - O ano.
 * @param {string} user - O utilizador.
 * @param {string} canvasId - O ID do elemento canvas onde o gráfico será desenhado.
 */

// script.js - Substituir esta função

// script.js - Substituir esta função

function criarOuAtualizarGraficoGastosCC(mes, year, user, canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error(`Canvas com ID "${canvasId}" não encontrado.`);
        return null;
    }
    ctx.style.display = 'block';

    const ccData = financeData.years[year]?.[user]?.['conta-corrente']?.[mes];
    const gastosEssenciais = ccData?.gastos?.essenciais || 0;
    const gastosPoupancas = ccData?.gastos?.poupancas || 0;
    const gastosDesejos = ccData?.gastos?.desejos || 0;
    const totalGastos = gastosEssenciais + gastosPoupancas + gastosDesejos;

    const data = {
        labels: ['Essenciais', 'Poupanças', 'Desejos'],
        datasets: [{
            data: [gastosEssenciais, gastosPoupancas, gastosDesejos],
            backgroundColor: ['#86BBD8', '#F2F2F2', '#33658A'],
            borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#2d2d2d' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 4
        }]
    };

    const chartInstanceName = `chart_${canvasId}`;
    if (charts.gastosCC[chartInstanceName]) {
        charts.gastosCC[chartInstanceName].destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            plugins: {
                // --- A CORREÇÃO CRÍTICA ESTÁ AQUI ---
                legend: {
                    display: false // Desativa a legenda padrão do Chart.js
                },
                // --- FIM DA CORREÇÃO ---
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (totalGastos === 0) return '';
                            const percentage = (context.parsed / totalGastos * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                },
                title: {
                    display: totalGastos === 0,
                    text: 'Sem dados de gastos para exibir',
                    color: '#95a5a6',
                    font: { size: 12 }
                }
            }
        }
    });

    charts.gastosCC[chartInstanceName] = newChart;
    return newChart;
}

/**
 * Exporta o conteúdo da tabela de Resumo Anual para um ficheiro CSV
 * que pode ser aberto diretamente no Excel.
 */
function exportarTabelaParaExcel() {
    const tabela = document.getElementById("annual-summary-table");
    if (!tabela) {
        mostrarToast('Tabela de resumo anual não encontrada.', 'error');
        return;
    }

    let csvContent = [];
    
    // Percorre todas as linhas da tabela (incluindo o cabeçalho e o corpo)
    const linhas = tabela.querySelectorAll("tr");
    linhas.forEach(linha => {
        const rowData = [];
        const colunas = linha.querySelectorAll("th, td"); // Pega tanto em cabeçalhos como em células

        colunas.forEach(coluna => {
            let cellData = coluna.innerText;

            // Limpeza de dados para o formato CSV/Excel:
            // 1. Remove o símbolo do Euro e espaços.
            // 2. Substitui o ponto de milhar por nada.
            // 3. Substitui a vírgula decimal por um ponto decimal.
            cellData = cellData.replace(/€/g, '').trim();
            cellData = cellData.replace(/\./g, '');
            cellData = cellData.replace(/,/g, '.');
            
            // Para garantir que o Excel não interpreta mal as vírgulas no texto,
            // envolvemos cada célula em aspas duplas.
            rowData.push(`"${cellData}"`);
        });
        csvContent.push(rowData.join(","));
    });

    // Junta todas as linhas com uma quebra de linha
    const csvString = csvContent.join("\n");

    // Cria um Blob (Binary Large Object) com o conteúdo CSV
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // Cria um link temporário para o download
    const link = document.createElement("a");
    if (link.download !== undefined) { // Verifica se o browser suporta o atributo download
        const url = URL.createObjectURL(blob);
        const { currentYear, currentUser } = financeData;
        link.setAttribute("href", url);
        link.setAttribute("download", `Resumo_Anual_${currentYear}_${currentUser}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    mostrarToast('Exportação para Excel iniciada.', 'success');
}


// script.js - Adicionar estas funções no final do ficheiro

/**
 * Abre e pré-preenche o modal para gerar o relatório PDF.
 */
function abrirModalPrint() {
    const { currentUser, currentYear } = financeData;
    const currentMonthIndex = new Date().getMonth();

    // Preenche os seletores com os valores atuais
    const userSelector = document.getElementById('printUserSelector');
    userSelector.innerHTML = '';
    ["JORGE", "RITA", "AMBOS"].forEach(user => {
        const option = document.createElement("option");
        option.value = user;
        option.textContent = user;
        option.selected = (user === currentUser);
        userSelector.appendChild(option);
    });

    const yearSelector = document.getElementById('printYearSelector');
    yearSelector.innerHTML = '';
    for (let ano = 2021; ano <= 2031; ano++) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        option.selected = (ano === currentYear);
        yearSelector.appendChild(option);
    }

    const monthSelector = document.getElementById('printMonthSelector');
    monthSelector.innerHTML = '';
    meses.forEach((mes, index) => {
        const option = document.createElement("option");
        option.value = mes;
        option.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
        option.selected = (index === currentMonthIndex);
        monthSelector.appendChild(option);
    });

    abrirModal('printReportModal');
}


// script.js - Substituir esta função

async function gerarRelatorioPDF() {
    mostrarToast('A gerar o seu relatório PDF...', 'info');
    
    const user = document.getElementById('printUserSelector').value;
    const year = parseInt(document.getElementById('printYearSelector').value);
    const mes = document.getElementById('printMonthSelector').value;
    const mesCapitalized = mes.charAt(0).toUpperCase() + mes.slice(1);

    const renderTarget = document.getElementById('pdf-render-target');

    // 1. Construir o HTML da lista principal (exatamente como antes)
    // ... (código de construção do listHTML para a lista de cards) ...
    const valoresPDF = {};
    let totalMes = 0;
    for (const categoria of Object.keys(categorias).filter(c => c !== 'total')) {
        const valor = obterValorMes(year, user, categoria, mes);
        valoresPDF[categoria] = valor;
        totalMes += valor;
    }
    valoresPDF['total'] = totalMes;
    let listHTML = '<div class="pdf-list-layout">';
    const displayOrder = ['conta-corrente', 'poupancas', 'ativos', 'outros', 'pprs', 'total'];
    for (const categoria of displayOrder) {
        const valor = valoresPDF[categoria];
        let percentage = 0;
        if (totalMes > 0 && categoria !== 'total') {
            percentage = (valor / totalMes) * 100;
        } else if (categoria === 'total') {
            percentage = 100;
        }
        const categoriaInfo = {
            'conta-corrente': { icon: 'fa-university', title: 'Conta Corrente' },
            'ativos': { icon: 'fa-chart-pie', title: 'Ativos' },
            'pprs': { icon: 'fa-piggy-bank', title: 'PPRs' },
            'poupancas': { icon: 'fa-wallet', title: 'Poupanças' },
            'outros': { icon: 'fa-ellipsis-h', title: 'Outros' },
            'total': { icon: 'fa-calculator', title: 'Total' }
        }[categoria];
        const percentageClass = percentage > 50 ? 'positive' : (percentage > 10 ? 'negative' : 'neutral');
        const percentageText = percentage > 0 ? `${percentage.toFixed(1)}%` : 'N/A';
        listHTML += `
            <div class="pdf-list-item">
                <div class="pdf-item-left">
                    <div class="pdf-item-icon ${categoria}"><i class="fas ${categoriaInfo.icon}"></i></div>
                    <div class="pdf-item-text">
                        <div class="pdf-item-title">${categoriaInfo.title}</div>
                        <div class="pdf-item-percentage ${percentageClass}">${percentageText}</div>
                    </div>
                </div>
                <div class="pdf-item-value">${formatarMoeda(valor)}</div>
            </div>
        `;
    }
    listHTML += '</div>';

    // 2. Lógica condicional para o gráfico E A NOVA LEGENDA
    const ccData = financeData.years[year]?.[user]?.['conta-corrente']?.[mes];
    const gastosEssenciais = ccData?.gastos?.essenciais || 0;
    const gastosPoupancas = ccData?.gastos?.poupancas || 0;
    const gastosDesejos = ccData?.gastos?.desejos || 0;
    const totalGastos = gastosEssenciais + gastosPoupancas + gastosDesejos;

    if (totalGastos > 0) {
        const percEssenciais = ((gastosEssenciais / totalGastos) * 100).toFixed(1);
        const percPoupancas = ((gastosPoupancas / totalGastos) * 100).toFixed(1);
        const percDesejos = ((gastosDesejos / totalGastos) * 100).toFixed(1);

        listHTML += `
            <div class="pdf-section-separator"></div>
            <div class="pdf-gastos-chart-section">
                <h3 class="pdf-gastos-chart-title"><i class="fas fa-university"></i><span>Conta Corrente</span></h3>
                
                <!-- O NOVO WRAPPER PARA O LAYOUT LADO A LADO -->
                <div class="pdf-chart-wrapper">
                    <div class="pdf-chart-container"><canvas id="pdf-gastos-chart"></canvas></div>
                    <div class="pdf-chart-legend">
                        <div class="pdf-legend-item">
                            <div class="pdf-legend-color-box" style="background-color: #86BBD8;"></div>
                            <div class="pdf-legend-label">Gastos Essenciais ${percEssenciais}%</div>
                        </div>
                        <div class="pdf-legend-item">
                            <div class="pdf-legend-color-box" style="background-color: #F2F2F2; border: 1px solid #ddd;"></div>
                            <div class="pdf-legend-label">Gastos Poupanças ${percPoupancas}%</div>
                        </div>
                        <div class="pdf-legend-item">
                            <div class="pdf-legend-color-box" style="background-color: #33658A;"></div>
                            <div class="pdf-legend-label">Gastos Desejos ${percDesejos}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 3. Renderizar o HTML e esperar pelo gráfico (exatamente como antes)
    renderTarget.innerHTML = listHTML;
    renderTarget.className = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark-theme-override' : '';
    
    if (totalGastos > 0) {
        criarOuAtualizarGraficoGastosCC(mes, year, user, 'pdf-gastos-chart');
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 4. Capturar a imagem e gerar o PDF (exatamente como antes)
    const canvas = await html2canvas(renderTarget, { scale: 3, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    pdf.setFontSize(18);
    pdf.text(`Relatório Mensal - ${mesCapitalized} ${year}`, pdfWidth / 2, margin, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Utilizador: ${user}`, pdfWidth / 2, margin + 8, { align: 'center' });
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    const yPosition = margin + 20;
    pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    pdf.setFontSize(8);
    pdf.setTextColor('#95a5a6');
    pdf.text('Documento Gerado automaticamente.', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    pdf.save(`Relatorio_${user}_${year}_${mesCapitalized}.pdf`);
    fecharModal('printReportModal');
    mostrarToast('Relatório PDF gerado com sucesso!', 'success');
}

// Adicione esta nova função no seu script.js, perto das outras funções de gráficos.

/**
 * Calcula a taxa de crescimento anual média com base em dados históricos.
 * @param {number[]} historicalData - Um array de valores anuais.
 * @returns {number} - A taxa de crescimento média (ex: 1.1 para 10% de crescimento).
 */
function calcularTaxaCrescimentoMedia(historicalData) {
    const dataPoints = historicalData.filter(v => v > 0); // Considera apenas anos com valor > 0
    if (dataPoints.length < 2) {
        return 1.05; // Se não houver dados suficientes, assume um crescimento padrão de 5%
    }

    let totalGrowthRate = 0;
    let periods = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousValue = historicalData[i - 1];
        const currentValue = historicalData[i];
        
        // Apenas calcula a taxa se o valor anterior for positivo para evitar divisão por zero
        if (previousValue > 0) {
            totalGrowthRate += currentValue / previousValue;
            periods++;
        }
    }

    if (periods === 0) {
        return 1.05; // Retorna a taxa padrão se não houver períodos válidos
    }

    const averageGrowthRate = totalGrowthRate / periods;
    // Garante que a taxa não seja negativa ou excessivamente baixa para projeções
    return Math.max(1, averageGrowthRate); 
}

/**
 * Gera dados de projeção com base no último valor e na taxa de crescimento.
 * @param {number} ultimoValor - O último valor conhecido.
 * @param {number} taxaCrescimento - A taxa de crescimento anual.
 * @param {number} numAnos - O número de anos a projetar.
 * @returns {number[]} - Um array com os valores projetados.
 */
function projetarValores(ultimoValor, taxaCrescimento, numAnos) {
    const projecoes = [];
    let valorAtual = ultimoValor;

    for (let i = 0; i < numAnos; i++) {
        valorAtual *= taxaCrescimento;
        projecoes.push(valorAtual);
    }
    return projecoes;
}

// Adicione esta nova função no seu script.js

/**
 * Cria ou atualiza um gráfico que inclui uma linha de dados históricos e uma linha de projeção.
 * @param {string} canvasId - O ID do elemento canvas.
 * @param {string} label - O rótulo principal para os dados.
 * @param {number[]} labels - Os rótulos do eixo X (anos).
 * @param {number[]} historicalData - Os dados históricos.
 * @param {number[]} projectionData - Os dados projetados.
 * @param {string} historicalColor - A cor da linha de histórico.
 * @param {string} projectionColor - A cor da linha de projeção (amarelo).
 */
function criarGraficoComProjecao(canvasId, label, labels, historicalData, projectionData, historicalColor, projectionColor) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // O nome da instância do gráfico é derivado do ID do canvas
    const chartInstanceName = canvasId.replace('chart-', '').replace('-', '');
    if (charts[chartInstanceName]) {
        charts[chartInstanceName].destroy();
    }

    // O último ponto do histórico é o primeiro da projeção para ligar as linhas
    const fullProjectionData = [...new Array(historicalData.length - 1).fill(null), historicalData[historicalData.length - 1], ...projectionData];

    charts[chartInstanceName] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Histórico ${label}`,
                    data: historicalData,
                    borderColor: historicalColor,
                    backgroundColor: historicalColor + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: `Projeção ${label}`,
                    data: fullProjectionData,
                    borderColor: projectionColor,
                    borderWidth: 3,
                    borderDash: [5, 5], // Linha tracejada para a projeção
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true, // Mostra a legenda para distinguir histórico de projeção
                    position: 'top',
                } 
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => formatarMoeda(value) }
                }
            },
            elements: { point: { radius: 5, hoverRadius: 7 } }
        }
    });
}

// No script.js, substitua a função existente por esta versão

function atualizarGraficosFuturo() {
    const { currentUser, currentYear } = financeData;

    // A lógica de definição de anos permanece a mesma
    const anosHistoricos = Array.from({ length: currentYear - 2021 + 1 }, (_, i) => 2021 + i);
    const anoInicioProjecao = currentYear + 1;
    const anosProjecao = Array.from({ length: 10 }, (_, i) => anoInicioProjecao + i);
    const todosOsAnos = [...anosHistoricos, ...anosProjecao];

    // Obter todos os dados históricos
    const dadosHistoricosTotal = anosHistoricos.map(ano => {
        let total = 0;
        Object.keys(categorias).filter(cat => cat !== 'total').forEach(categoria => {
            total += obterUltimoValorPreenchido(ano, currentUser, categoria);
        });
        return total;
    });
    const dadosHistoricosPPRs = anosHistoricos.map(ano => obterUltimoValorPreenchido(ano, currentUser, 'pprs'));
    const dadosHistoricosAtivos = anosHistoricos.map(ano => obterUltimoValorPreenchido(ano, currentUser, 'ativos'));

    // --- NOVA LÓGICA PARA A TAXA DE CRESCIMENTO DOS PPRs ---
    // 1. Pegamos nos dados históricos completos dos PPRs.
    // 2. Usamos o método .slice(-3) para obter apenas os últimos 3 elementos (anos) do array.
    const ultimos3AnosPPRs = dadosHistoricosPPRs.slice(-3);
    
    // 3. Calculamos a taxa de crescimento média usando APENAS esses 3 anos.
    const taxaPPRs = calcularTaxaCrescimentoMedia(ultimos3AnosPPRs);
    // --- FIM DA NOVA LÓGICA ---

    // Calcular as outras taxas de crescimento normalmente, usando o histórico completo
    const taxaTotal = calcularTaxaCrescimentoMedia(dadosHistoricosTotal);
    const taxaAtivos = calcularTaxaCrescimentoMedia(dadosHistoricosAtivos);

    // Gerar projeções (a lógica aqui permanece a mesma)
    const ultimoValorTotal = dadosHistoricosTotal[dadosHistoricosTotal.length - 1] || 0;
    const ultimoValorPPRs = dadosHistoricosPPRs[dadosHistoricosPPRs.length - 1] || 0;
    const ultimoValorAtivos = dadosHistoricosAtivos[dadosHistoricosAtivos.length - 1] || 0;

    const projecaoTotal = projetarValores(ultimoValorTotal, taxaTotal, anosProjecao.length);
    const projecaoPPRs = projetarValores(ultimoValorPPRs, taxaPPRs, anosProjecao.length); // Esta projeção usará a nova taxa calculada
    const projecaoAtivos = projetarValores(ultimoValorAtivos, taxaAtivos, anosProjecao.length);

    // Desenhar os gráficos (nenhuma alteração necessária aqui)
    const corProjecao = '#f39c12'; // Amarelo
    criarGraficoComProjecao('chart-futuro-total', 'Total', todosOsAnos, dadosHistoricosTotal, projecaoTotal, '#2563eb', corProjecao);
    criarGraficoComProjecao('chart-futuro-pprs', 'PPRs', todosOsAnos, dadosHistoricosPPRs, projecaoPPRs, '#dc2626', corProjecao);
    criarGraficoComProjecao('chart-futuro-ativos', 'Ativos', todosOsAnos, dadosHistoricosAtivos, projecaoAtivos, '#16a34a', corProjecao);
}

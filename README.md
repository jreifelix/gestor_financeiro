# 💰 Gestor Financeiro Pessoal

## 📜 Sobre o Projeto

O **Gestor Financeiro** é uma aplicação web desenvolvida para simplificar o registo e a análise das finanças pessoais. Criada com o objetivo de ser uma ferramenta intuitiva e visual, permite ao utilizador acompanhar a evolução do seu património, definir objetivos e visualizar o crescimento dos seus ativos ao longo do tempo.

A aplicação funciona diretamente no navegador, utilizando `localStorage` para guardar os dados de forma segura e privada no dispositivo do utilizador, sem a necessidade de uma base de dados externa.

**[Aceda à aplicação aqui!](https://jreifelix.github.io/gestor_financeiro/ )**

---

## ✨ Funcionalidades Principais

-   **Dashboard Intuitivo:** Visão geral e imediata do seu património, dividido por categorias como Conta Corrente, Ativos, PPRs, Poupanças e Outros.
-   **Registo Mensal Detalhado:** Insira os seus ganhos e gastos mensais, bem como o valor atualizado dos seus investimentos e poupanças.
-   **Multi-Utilizador:** Permite a gestão separada das finanças de diferentes utilizadores (ex: "JORGE", "RITA") e uma visão consolidada ("AMBOS").
-   **Análise Histórica:** Visualize a evolução do seu património através de gráficos anuais interativos.
-   **Projeções Futuras:** Um separador dedicado a projetar o crescimento dos seus ativos para os próximos 10 anos, com base na sua performance histórica.
-   **Definição de Objetivos:** Estabeleça metas anuais para cada categoria e acompanhe o seu progresso.
-   **Importação e Exportação:** Faça backups dos seus dados em formato JSON e importe-os a qualquer momento, garantindo que nunca perde o seu histórico.
-   **Geração de Relatórios:** Crie relatórios mensais em PDF com um resumo visual da sua situação financeira.
-   **Tema Claro e Escuro:** Adapte a interface da aplicação à sua preferência visual.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído de raiz utilizando tecnologias web standard, sem depender de frameworks complexos.

-   **HTML5:** Para a estrutura semântica da aplicação.
-   **CSS3:** Para a estilização, design responsivo e temas (claro/escuro).
-   **JavaScript (Vanilla):** Para toda a lógica da aplicação, incluindo manipulação do DOM, cálculos financeiros, gestão de estado e interatividade.
-   **Chart.js:** Biblioteca utilizada para criar os gráficos dinâmicos e visualmente apelativos.
-   **jsPDF & html2canvas:** Bibliotecas usadas para a funcionalidade de exportação de relatórios para PDF.
-   **Font Awesome:** Para a inclusão de ícones em toda a interface.

---

## 🔧 Como Utilizar

1.  **Aceder à Aplicação:** Abra o link [https://jreifelix.github.io/gestor_financeiro/](https://jreifelix.github.io/gestor_financeiro/ ).
2.  **Selecionar Utilizador e Ano:** Utilize os seletores no topo para escolher o utilizador e o ano que deseja visualizar ou editar.
3.  **Registar Dados:**
    -   Utilize o botão **Registo Rápido** (`+`) para inserir os dados de um mês completo de forma rápida.
    -   Navegue pelos separadores (`Conta Corrente`, `Ativos`, etc.) para editar os valores de cada mês individualmente.
4.  **Analisar:**
    -   O **Dashboard** mostra um resumo do último mês preenchido.
    -   O separador **Resumo Anual** apresenta uma tabela com todos os valores do ano.
    -   Os separadores **Gráficos** e **Futuro** oferecem uma análise visual da sua evolução.
5.  **Exportar Dados:**
    -   Regularmente, utilize o botão **Exportar** para guardar uma cópia de segurança dos seus dados em formato `.json`.

---

## 👨‍💻 Autor

-   **Jorge Félix**
-   **GitHub:** [@jreifelix](https://github.com/jreifelix )


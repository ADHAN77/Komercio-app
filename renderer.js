const { ipcRenderer } = require("electron");
const productForm = document.getElementById("productForm");
const totalSales = document.getElementById("totalSales");
const dailySales = document.getElementById("dailySales");
const weeklySales = document.getElementById("weeklySales");
const monthlySales = document.getElementById("monthlySales");

function fecharApp() {
    console.log("Fechando app...");
    ipcRenderer.send("fechar-app");
}

// Carregar produtos do armazenamento local
function loadProducts() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    renderProducts(products);
}

// Salvar produtos no armazenamento local
function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

// Carregar histórico de vendas
function loadSalesHistory() {
    const history = JSON.parse(localStorage.getItem("salesHistory")) || [];
    renderSalesHistory(history);
}

// Salvar histórico de vendas
function saveSalesHistory(history) {
    localStorage.setItem("salesHistory", JSON.stringify(history));
}

// Função para formatar valores em moeda brasileira
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let produtosSelecionados = [];

function renderizarProdutosDisponiveis() {
    const container = document.getElementById("productContainer");
    const produtos = JSON.parse(localStorage.getItem("products")) || [];
    const filtro = document.getElementById("searchInput").value.toLowerCase();
    
    container.innerHTML = "";
    
    produtos
      .filter(p => p.name.toLowerCase().includes(filtro))
      .forEach((produto) => {
        const card = document.createElement("div");
        card.className = "col-md-6 mb-4";
    
        const isSemEstoque = produto.quantity <= 0;
    
        card.innerHTML = `
            <div class="card card-verde-claro h-100 p-3">
            <h5>${produto.name}</h5>
            <p>Estoque: <strong>${produto.quantity}</strong></p>
            <p>Preço: ${formatCurrency(produto.price)}</p>
            <button 
                class="btn ${isSemEstoque ? 'btn-custom-disabled' : 'btn-primary'}"
                onclick="adicionarProduto('${produto.name}')"
                ${isSemEstoque ? 'disabled' : ''}>
                Adicionar à venda
            </button>
            </div>
        `;
    
        container.appendChild(card);
      });
  }

  function adicionarProduto(nome) {
    const produtos = JSON.parse(localStorage.getItem("products")) || [];
    const index = produtos.findIndex(p => p.name === nome);
    if (index === -1) return;
  
    const produto = produtos[index];
  
    if (produto.quantity <= 0) return;
  
    produtos[index].quantity -= 1;
    localStorage.setItem("products", JSON.stringify(produtos));
  
    const existente = produtosSelecionados.find(p => p.name === produto.name);
    if (existente) {
      existente.qtd += 1;
    } else {
      produtosSelecionados.push({
        name: produto.name,
        price: produto.price,
        qtd: 1
      });
    }
  
    atualizarCarrinho();
    renderizarProdutosDisponiveis();
  }

  function atualizarCarrinho() {
    const lista = document.getElementById("selectedProductsList");
    const totalSpan = document.getElementById("totalVenda");
    lista.innerHTML = "";
    let total = 0;
  
    produtosSelecionados.forEach((prod, index) => {
      const subtotal = prod.price * prod.qtd;
      total += subtotal;
  
      const item = document.createElement("li");
      item.className = "list-group-item d-flex justify-content-between align-items-center";
  
      item.innerHTML = `
        <div>
          <strong>${prod.name}</strong>
          <div class="d-flex align-items-center mt-1">
            <button class="btn btn-sm btn-outline-secondary me-2" onclick="diminuirQuantidade(${index})">-</button>
            <span>${prod.qtd}</span>
            <button class="btn btn-sm btn-outline-secondary ms-2" onclick="aumentarQuantidade(${index})">+</button>
            <span class="ms-3 text-muted">(${formatCurrency(prod.price)} cada)</span>
          </div>
        </div>
        <div class="text-end">
          <div>${formatCurrency(subtotal)}</div>
          <button class="btn btn-sm btn-danger mt-1" onclick="removerProduto(${index})">Remover</button>
        </div>
      `;
  
      lista.appendChild(item);
    });
  
    totalSpan.textContent = formatCurrency(total);
  }
  
  function removerProduto(index) {
    const produto = produtosSelecionados[index];
  
    const produtos = JSON.parse(localStorage.getItem("products")) || [];
    const produtoOriginal = produtos.find(p => p.name === produto.name);
    if (produtoOriginal) {
      produtoOriginal.quantity += produto.qtd;
      localStorage.setItem("products", JSON.stringify(produtos));
    }
  
    produtosSelecionados.splice(index, 1);
  
    atualizarCarrinho();
    renderizarProdutosDisponiveis();
  }
  
  function aumentarQuantidade(index) {
    const produtos = JSON.parse(localStorage.getItem("products")) || [];
    const produtoSelecionado = produtosSelecionados[index];
    const produtoOriginal = produtos.find(p => p.name === produtoSelecionado.name);
  
    if (produtoOriginal && produtoOriginal.quantity > 0) {
      produtoSelecionado.qtd += 1;
      produtoOriginal.quantity -= 1;
  
      localStorage.setItem("products", JSON.stringify(produtos));
      atualizarCarrinho();
      renderizarProdutosDisponiveis();
    }
  }
  
  function diminuirQuantidade(index) {
    const produtoSelecionado = produtosSelecionados[index];
  
    if (produtoSelecionado.qtd > 1) {
      const produtos = JSON.parse(localStorage.getItem("products")) || [];
      const produtoOriginal = produtos.find(p => p.name === produtoSelecionado.name);
  
      produtoSelecionado.qtd -= 1;
      if (produtoOriginal) {
        produtoOriginal.quantity += 1;
        localStorage.setItem("products", JSON.stringify(produtos));
      }
  
      atualizarCarrinho();
      renderizarProdutosDisponiveis();
    } else {
      removerProduto(index);
    }
  }

  document.getElementById("searchInput").addEventListener("input", renderizarProdutosDisponiveis);

// Renderizar produtos (Sem botão "Vender")
function renderProducts() {
    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    const products = JSON.parse(localStorage.getItem("products")) || [];

    products.forEach((product, index) => {
        const productCard = document.createElement("div");
        productCard.classList.add("col-md-4", "mb-3");

        productCard.innerHTML = `
            <div class="card card-verde-claro p-3">
                <h5>${product.name}</h5>
                <p>Estoque: <strong>${product.quantity}</strong></p>
                <p>Preço: ${formatCurrency(product.price)}</p>
                ${product.quantity === 0 
                    ? `<span class="badge">Esgotado</span>` 
                    : ""
                }
                <button class="btn btn-primary btn-edit mt-2" data-index="${index}">Editar</button>
                <button class="btn btn-primary btn-delete mt-2" data-index="${index}">Excluir</button>
            </div>
        `;

        productList.appendChild(productCard);
    });

    // Corrigindo os eventos dos botões "Editar" e "Excluir"
    productList.addEventListener("click", function (event) {
        if (event.target.classList.contains("btn-edit")) {
            editProduct(event.target.getAttribute("data-index"));
        } else if (event.target.classList.contains("btn-delete")) {
            deleteProduct(event.target.getAttribute("data-index"));
        }
    });
}

// Criar notificações visuais sem travar a interface
function showNotification(message, type = "success") {
    const toast = document.createElement("div");
    toast.classList.add("toast", "position-fixed", "top-50", "start-50", "translate-middle", "show", "text-bg-" + type, "border-0");
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Adicionar produto
productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const price = parseFloat(document.getElementById("price").value);

    console.log("Produto cadastrado:", { name, quantity, price });

    if (!name || quantity < 0 || price < 0) {
        showNotification("Preencha os campos corretamente!", "danger");
        return;
    }

    const products = JSON.parse(localStorage.getItem("products")) || [];
    products.push({ name, quantity, price });
    localStorage.setItem("products", JSON.stringify(products));
    
    renderProducts();
    productForm.reset();
});

function finalizarVenda() {
    if (produtosSelecionados.length === 0) {
        showToast("Nenhum produto foi adicionado à venda.", "warning");
        return;
    }

    const nomeCliente = document.getElementById("clienteNome").value;
    const telefoneCliente = document.getElementById("clienteTelefone").value;
    const cpfCliente = document.getElementById("clienteCPF").value;
    const formaPagamento = document.getElementById("formaPagamento").value;

    const history = JSON.parse(localStorage.getItem("salesHistory")) || [];

    const venda = {
        data: new Date().toISOString(),
        formaPagamento, // 👈 novo campo
        cliente: {
            nome: nomeCliente,
            telefone: telefoneCliente,
            cpf: cpfCliente
        },
        produtos: produtosSelecionados.map(prod => ({
            nome: prod.name,
            quantidade: prod.qtd,
            valorUnitario: prod.price,
            subtotal: prod.qtd * prod.price,
        })),
        total: produtosSelecionados.reduce((acc, prod) => acc + (prod.qtd * prod.price), 0)
    };

    history.push(venda);
    localStorage.setItem("salesHistory", JSON.stringify(history));

    // Limpar dados
    produtosSelecionados = [];
    document.getElementById("searchInput").value = "";
    document.getElementById("clienteNome").value = "";
    document.getElementById("clienteTelefone").value = "";
    document.getElementById("clienteCPF").value = "";
    document.getElementById("formaPagamento").selectedIndex = 0;

    atualizarCarrinho();
    renderizarProdutosDisponiveis();
    renderProducts();
    calculateSalesStats();

    showToast("Venda finalizada com sucesso!", "venda");

       // 🔊 Tocar som de sucesso
       const audio = new Audio("assets/sound/level-up-289723.mp3");
       audio.play();
}

// Fechar a modal corretamente ao cancelar
document.querySelector("#confirmSellModal .btn-secondary").addEventListener("click", function () {
    const confirmSellModal = bootstrap.Modal.getInstance(document.getElementById("confirmSellModal"));
    if (confirmSellModal) {
        confirmSellModal.hide();
    }

    // Remove o fundo escurecido manualmente e restaura o scroll
    removeModalBackdrop();
});

// Fechar a modal corretamente ao clicar no "X"
document.querySelector("#confirmSellModal .btn-close").addEventListener("click", function () {
    const confirmSellModal = bootstrap.Modal.getInstance(document.getElementById("confirmSellModal"));
    if (confirmSellModal) {
        confirmSellModal.hide();
    }

    // Remove o fundo escurecido manualmente e restaura o scroll
    removeModalBackdrop();
});

// Função para remover o fundo escurecido manualmente e restaurar o scroll
const removeModalBackdrop = () => {
    // Remove a classe "modal-open" do body
    document.body.classList.remove("modal-open");

    // Remove qualquer backdrop
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops[0]) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
    }

    // Restaura o scroll da página
    document.body.style.overflow = "auto";
};

// Modal de Edição de Produto
const editProductModal = document.getElementById("editProductModal");
const editProductModalInstance = new bootstrap.Modal(editProductModal);

// Fechar a modal de edição corretamente
document.getElementById("editProductModal").addEventListener("hidden.bs.modal", function () {
    // Remover o fundo escurecido manualmente
    removeModalBackdrop();
});

// Garantir que o backdrop seja removido ao abrir qualquer modal
document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener('shown.bs.modal', function () {
        removeModalBackdrop(); // Remover o fundo escurecido e restaurar o scroll quando qualquer modal for aberta
    });
});

// Editar um produto (Correção: Garantindo que o modal seja aberto corretamente)
function editProduct(index) {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    document.getElementById("editIndex").value = index;
    document.getElementById("editName").value = products[index].name;
    document.getElementById("editQuantity").value = products[index].quantity;
    document.getElementById("editPrice").value = products[index].price;

    // Corrigindo a inicialização do modal
    const editModalElement = document.getElementById("editProductModal");
    const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
    editModal.show();
}

// Salvar Alterações (Correção: Fechamento correto do modal)
document.getElementById("saveEditBtn").addEventListener("click", function () {
    let index = document.getElementById("editIndex").value;
    let products = JSON.parse(localStorage.getItem("products")) || [];

    products[index].name = document.getElementById("editName").value;
    products[index].quantity = parseInt(document.getElementById("editQuantity").value);
    products[index].price = parseFloat(document.getElementById("editPrice").value);

    // Atualiza o localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // Corrigindo fechamento do modal
    const editModalElement = document.getElementById("editProductModal");
    const editModal = bootstrap.Modal.getOrCreateInstance(editModalElement);
    editModal.hide();

    // Atualiza a lista de produtos na tela
    renderProducts();
});

// Excluir um produto
function deleteProduct(index) {
    productToDeleteIndex = index; // Salva o índice do produto a ser excluído

    const confirmModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    confirmModal.show();
}

let productToDeleteIndex = null; // Variável para armazenar o índice

// Quando clicar no botão "Excluir" dentro do modal
document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
    if (productToDeleteIndex !== null) {
        let products = JSON.parse(localStorage.getItem("products")) || [];

        if (products[productToDeleteIndex]) {
            showNotification(`Produto "${products[productToDeleteIndex].name}" excluído!`, "danger");

            products.splice(productToDeleteIndex, 1);
            localStorage.setItem("products", JSON.stringify(products));

            renderProducts();
        }

        productToDeleteIndex = null; // Reseta a variável
    }

    // Fecha o modal corretamente
    const confirmModalElement = document.getElementById("confirmDeleteModal");
    const confirmModal = bootstrap.Modal.getOrCreateInstance(confirmModalElement);
    confirmModal.hide();

    // Remove a classe "modal-open" e o fundo escurecido manualmente, se necessário
    document.body.classList.remove("modal-open");
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops[0]) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
    }
    
});

// Garante que o modal remova o fundo escuro quando for fechado
document.getElementById("confirmDeleteModal").addEventListener("hidden.bs.modal", function () {
    document.body.classList.remove("modal-open");
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops[0]) {
        backdrops[0].parentNode.removeChild(backdrops[0]);
    }
});

// Função para garantir que o scroll do body volte ao normal após qualquer modal ser fechada
document.addEventListener("hidden.bs.modal", function () {
    setTimeout(() => {
        if (!document.querySelector(".modal.show")) {
            document.body.style.overflow = "auto";
            document.body.style.paddingRight = "0px"; // Corrige possíveis deslocamentos laterais
        }
    }, 300); // Pequeno delay para evitar conflitos com animações do Bootstrap
});

// Função de filtro de vendas por data
document.getElementById('filterDateBtn').addEventListener('click', function() {
    const selectedDate = document.getElementById('dateFilter').value;
    const history = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    if (selectedDate) {
        const filteredHistory = history.filter(sale => {
            const saleDate = new Date(sale.date);
            const saleDateString = saleDate.toISOString().split('T')[0]; // Pega só a data no formato 'YYYY-MM-DD'
            return saleDateString === selectedDate;
        });

        if (filteredHistory.length > 0) {
            renderSalesHistory(filteredHistory); // Exibe as vendas filtradas
        } else {
            showNotification("Não há vendas nesta data.", "warning"); // Mensagem se não houver vendas
            renderSalesHistory([]); // Exibe a lista vazia
        }
    } else {
        showNotification("Selecione uma data para filtrar.", "komercio"); // Mensagem de alerta se a data não for escolhida
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const historyList = document.getElementById("historyList");
    const dateFilter = document.getElementById("dateFilter");
    const filterDateBtn = document.getElementById("filterDateBtn");
    const resetDateBtn = document.getElementById("resetDateBtn");

    // Obtém a data atual no formato YYYY-MM-DD
    function getCurrentDate() {
        return new Date().toISOString().split("T")[0];
    }

    // Renderizar total de vendas de vendas
    function renderSalesHistory(history, selectedDate = null) {
        const historyList = document.getElementById("historyList");
        historyList.innerHTML = "";
    
        const today = new Date().toISOString().split("T")[0];
        if (!selectedDate) selectedDate = today;
    
        const filteredHistory = history.filter(sale => {
            const saleDate = new Date(sale.data);
            const dateString = saleDate.toISOString().split("T")[0];
            return dateString === selectedDate;
        });
    
        if (filteredHistory.length === 0) {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "text-center");
            listItem.textContent = "Nenhuma venda registrada nesta data.";
            historyList.appendChild(listItem);
        } else {
            filteredHistory.forEach((sale, index) => {
                const saleDate = new Date(sale.data);
                const formattedDate = saleDate.toLocaleString("pt-BR");
    
                const listItem = document.createElement("li");
                listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
                listItem.textContent = `Venda para ${sale.cliente?.nome || "Cliente não informado"} - ${formattedDate}`;
                listItem.style.cursor = "pointer";
                listItem.dataset.index = index;
    
                listItem.addEventListener("click", () => openSaleDetailsModal(sale));
                historyList.appendChild(listItem);
            });
        }
    }

    function loadSalesHistory(date = null) {
        const history = JSON.parse(localStorage.getItem("salesHistory")) || [];
        renderSalesHistory(history, date);
    }

    function openSaleDetailsModal(sale) {
        const modalBody = document.getElementById("saleDetailsBody");
        modalBody.innerHTML = `
            <p><strong>Nome:</strong> ${sale.cliente?.nome || "Não informado"}</p>
            <p><strong>Telefone:</strong> ${sale.cliente?.telefone || "Não informado"}</p>
            <p><strong>CPF:</strong> ${sale.cliente?.cpf || "Não informado"}</p>
            <p><strong>Forma de Pagamento:</strong> ${sale.formaPagamento || "Não informado"}</p>
            <hr/>
            <p><strong>Produtos:</strong></p>
            <ul>
                ${sale.produtos.map(prod => `
                    <li>${prod.nome} - ${prod.quantidade}x ${prod.valorUnitario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} = 
                    <strong>${(prod.quantidade * prod.valorUnitario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></li>
                `).join("")}
            </ul>
            <hr/>
            <p><strong>Total da venda:</strong> 
                <span style="font-size: 1.1em; font-weight: bold;">
                    ${sale.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
            </p>
        `;
    
        const modal = new bootstrap.Modal(document.getElementById("saleDetailsModal"));
        modal.show();
    }
    
    // Ao clicar em "Filtrar", carrega vendas da data escolhida
    filterDateBtn.addEventListener("click", () => {
        const selectedDate = dateFilter.value;
        if (selectedDate) {
            loadSalesHistory(selectedDate);
        }
    });

    // Botão "Hoje" volta para as vendas do dia atual
    resetDateBtn.addEventListener("click", () => {
        dateFilter.value = ""; // Limpa o campo de data
    
        // Obtém a data local corretamente sem fuso horário
        const today = new Date();
        const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayString = localToday.toISOString().split("T")[0];
    
        loadSalesHistory(todayString); // Mostra apenas vendas do dia atual
    })

    // Adiciona uma nova venda e mantém a data filtrada ativa
    function addSale(name, price) {
        const history = JSON.parse(localStorage.getItem("salesHistory")) || [];
        const newSale = {
            name,
            price,
            date: new Date().toISOString() // Data no formato ISO
        };

        history.push(newSale);
        localStorage.setItem("salesHistory", JSON.stringify(history));

        // Verifica se há uma data selecionada no filtro
        const selectedDate = dateFilter.value || getCurrentDate();
        loadSalesHistory(selectedDate); // Atualiza a lista sem resetar a data
    }

    // Ao carregar a página, mostra as vendas de hoje automaticamente
    loadSalesHistory(getCurrentDate());
});


//Função barra de pesquisa
document.getElementById("searchInputEdit").addEventListener("input", function () {
    let searchText = this.value.toLowerCase();
    let productCards = document.querySelectorAll("#productList .card");

    productCards.forEach((card) => {
        let productName = card.querySelector("h5").textContent.toLowerCase();
        if (productName.includes(searchText)) {
            card.parentElement.style.display = "block";
        } else {
            card.parentElement.style.display = "none";
        }
    });
});

// Calculadora das vendas totais
function calculateSalesStats() {
    const history = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const today = new Date();
    let totalDay = 0, totalWeek = 0, totalMonth = 0, totalYear = 0, totalAllTime = 0;
    let totalVendasDay = 0, totalVendasWeek = 0, totalVendasMonth = 0, totalVendasYear = 0, totalVendasAllTime = 0;

    history.forEach(sale => {
        const saleDate = new Date(sale.data);
        const isSameDay = saleDate.toDateString() === today.toDateString();
        const isSameMonth = saleDate.getFullYear() === today.getFullYear() && saleDate.getMonth() === today.getMonth();
        const isSameYear = saleDate.getFullYear() === today.getFullYear();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        let saleTotal = 0;
        sale.produtos.forEach(prod => {
            const subtotal = prod.valorUnitario * prod.quantidade;
            saleTotal += subtotal;
        });

        // Contabilizando as vendas
        totalAllTime += saleTotal;
        if (isSameDay) {
            totalDay += saleTotal;
            totalVendasDay += 1;
        }
        if (saleDate >= sevenDaysAgo) {
            totalWeek += saleTotal;
            totalVendasWeek += 1;
        }
        if (isSameMonth) {
            totalMonth += saleTotal;
            totalVendasMonth += 1;
        }
        if (isSameYear) {
            totalYear += saleTotal;
            totalVendasYear += 1;
        }

        totalVendasAllTime += 1;
    });

    // Atualizando a UI com as informações de total de vendas e valor total
    dailySales.textContent = `${formatCurrency(totalDay)} | ${totalVendasDay} Vendas`;
    weeklySales.textContent = `${formatCurrency(totalWeek)} | ${totalVendasWeek} Vendas`;
    monthlySales.textContent = `${formatCurrency(totalMonth)} | ${totalVendasMonth} Vendas`;
    yearlySales.textContent = `${formatCurrency(totalYear)} | ${totalVendasYear} Vendas`;
    totalSales.textContent = `${formatCurrency(totalAllTime)} | ${totalVendasAllTime} Vendas`;
}

// Chama a função ao carregar a página e após cada venda
document.addEventListener("DOMContentLoaded", calculateSalesStats);

function showSection(sectionId, clickedLink) {
    // Mostra/Esconde as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');

    // Atualiza os links do menu
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(link => {
        link.classList.remove('active-link');
    });
    clickedLink.classList.add('active-link');

    // Atualiza o título da página (opcional)
    const pageTitle = {
        cadastro: "Cadastro de Produtos",
        lista: "Lista de Produtos",
        resumo: "Resumo de Vendas",
        historico: "Histórico de Vendas"
    };
    document.querySelector('.content h1, .content h2').innerText = pageTitle[sectionId];
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
  
    const toastId = `toast-${Date.now()}`;
    const bgColor = type === "success" ? "bg-success" : type === "error" ? "bg-danger" : "bg-secondary";
  
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white ${bgColor} border-0 mb-2`;
    toast.id = toastId;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
  
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
  
    toastContainer.appendChild(toast);
  
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
  
    // Remove o toast do DOM depois de escondido
    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }
 

// Carregar dados ao iniciar
loadProducts();
loadSalesHistory();

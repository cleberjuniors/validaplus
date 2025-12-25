


 let ordenarPorData = false;

const btnOrdenar = document.getElementById("ordenarData");

if (btnOrdenar) {
  btnOrdenar.addEventListener("click", () => {
    ordenarPorData = !ordenarPorData;
    btnOrdenar.classList.toggle("ativo"); // opcional (visual)
    renderProdutos();
  });
}



let filtroAtual = "todos";

// PROTEÇÃO DE ROTA
const usuario = localStorage.getItem("usuarioLogado");
if (!usuario) {
  window.location.href = "login.html";
}

function notificar(titulo, mensagem) {
  if (Notification.permission === "granted") {
    new Notification(titulo, {
      body: mensagem
    });
  }
}
function verificarNotificacoes() {
  const produtos = getProdutos();
  let alterado = false;

  produtos.forEach(p => {
    const dias = diasRestantes(p.validade);

    if (!p.notificado && dias <= 3) {
      notificar(
        dias < 0 ? "Produto vencido ❌" : "Produto perto de vencer ⚠️",
        `${p.nome} vence em ${dias} dia(s)`
      );

      p.notificado = true;
      alterado = true;
    }
  });

  if (alterado) saveProdutos(produtos);
}



// BUSCAR PRODUTOS DO USUÁRIO
function getProdutos() {
  const dados = JSON.parse(localStorage.getItem("produtos")) || {};
  return dados[usuario] || [];
}

// SALVAR PRODUTOS
function saveProdutos(produtos) {
  const dados = JSON.parse(localStorage.getItem("produtos")) || {};
  dados[usuario] = produtos;
  localStorage.setItem("produtos", JSON.stringify(dados));
}

// CALCULAR DIAS RESTANTES
function diasRestantes(dataValidade) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const validade = new Date(dataValidade);
  validade.setHours(0, 0, 0, 0);

  const diff = validade - hoje;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}



// RENDERIZAR LISTA
function renderProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  let produtos = getProdutos();

  // 1️⃣ ORDENA (se ativo)
  if (ordenarPorData) {
    produtos.sort((a, b) => {
      return diasRestantes(a.validade) - diasRestantes(b.validade);
    });
  }

  // 2️⃣ FILTRA + RENDERIZA
  produtos.forEach((p, index) => {
    const dias = diasRestantes(p.validade);

    let status = "ok";
    if (dias < 0) status = "vencido";
    else if (dias <= 7) status = "alerta";

    // 🔥 FILTRO AQUI
    if (filtroAtual !== "todos" && status !== filtroAtual) return;

    const li = document.createElement("li");
    li.className = status;
    li.innerHTML = `
      <strong>${p.nome}</strong><br>
      Validade: ${p.validade}<br>
      Dias restantes: ${dias}
      <button onclick="removerProduto(${index})">X</button>
    `;

    lista.appendChild(li);
  });
}

// ADICIONAR PRODUTO
document.getElementById("produtoForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const validade = document.getElementById("validade").value;

  const produtos = getProdutos();
  produtos.push({
    nome,
    validade,
    notificado: false
  });

  saveProdutos(produtos);
  e.target.reset();
  renderProdutos();
  verificarNotificacoes(); // 👈 AQUI
});

// REMOVER
function removerProduto(index) {
  const produtos = getProdutos();
  produtos.splice(index, 1);
  saveProdutos(produtos);
  renderProdutos();
}

// LOGOUT
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
});

// INICIAR// INICIAR
renderProdutos();
verificarNotificacoes();

// FILTROS
document.querySelectorAll(".filtros button").forEach(btn => {
  btn.addEventListener("click", () => {
    filtroAtual = btn.dataset.filtro;

    document.querySelectorAll(".filtros button")
      .forEach(b => b.classList.remove("ativo"));

    btn.classList.add("ativo");
    renderProdutos();
  });
});

// BOTÃO NOTIFICAÇÃO
const btnNotificacao = document.getElementById("ativarNotificacao");

// se já estiver permitido, esconde ao carregar
if (btnNotificacao && "Notification" in window && Notification.permission === "granted") {
  btnNotificacao.style.display = "none";
}

if (btnNotificacao) {
  btnNotificacao.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações");
      return;
    }

    const permissao = await Notification.requestPermission();

    if (permissao === "granted") {
      alert("Notificações ativadas ✅");
      btnNotificacao.style.display = "none";
      verificarNotificacoes();
    } else {
      alert("Notificações bloqueadas ❌");
    }
  });
}


// TEMA
// TEMA
const toggleTema = document.getElementById("toggleTema");

if (toggleTema) {
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark");
    toggleTema.textContent = "☀️";
  }

  toggleTema.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const tema = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("tema", tema);

    toggleTema.textContent = tema === "dark" ? "☀️" : "🌙";
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/validaplus/sw.js")
      .then(() => console.log("Service Worker registrado ✅"))
      .catch(err => console.log("Erro no SW ❌", err));
  });
}

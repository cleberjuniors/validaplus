let streamAtual = null;

 let ordenarPorData = false;

const btnOrdenar = document.getElementById("ordenarData");

if (btnOrdenar) {
  btnOrdenar.addEventListener("click", () => {
    ordenarPorData = !ordenarPorData;
    btnOrdenar.classList.toggle("ativo"); // opcional (visual)
    renderProdutos();
  });
}

let termoBusca = "";

const inputBusca = document.getElementById("buscaProduto");

if (inputBusca) {
  inputBusca.addEventListener("input", () => {
    termoBusca = inputBusca.value.toLowerCase();
    renderProdutos();
    const produtos = getProdutos();

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
    p.lotes.forEach(lote => {
      const dias = diasRestantes(lote.validade);

      if (!lote.notificado && dias <= 3) {
        notificar(
          dias < 0 ? "Produto vencido ❌" : "Produto perto de vencer ⚠️",
          `${p.nome} vence em ${dias} dia(s)`
        );

        lote.notificado = true;
        alterado = true;
      }
    });
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
  const tabela = document.getElementById("listaProdutos");
  tabela.innerHTML = "";

  const produtos = getProdutos();

  produtos.forEach((produto, pIndex) => {

    // 🔍 BUSCA PARCIAL (código ou nome)
    if (termoBusca) {
      const codigo = produto.codigo.toLowerCase();
      const nome = produto.nome.toLowerCase();

      if (
        !codigo.includes(termoBusca) &&
        !nome.includes(termoBusca)
      ) {
        return; // pula esse produto inteiro
      }
    }

    produto.lotes.forEach((lote, lIndex) => {
      const dias = diasRestantes(lote.validade);

      let status = "ok";
      if (dias < 0) status = "vencido";
      else if (dias <= 7) status = "alerta";

      // filtro por status
      if (filtroAtual !== "todos" && status !== filtroAtual) return;

      const tr = document.createElement("tr");
      tr.className = status;

      tr.innerHTML = `
        <td>📦</td>
        <td>${produto.codigo}</td>
        <td>${produto.nome}</td>
        <td>${lote.local}</td>
        <td>${lote.validade}</td>
        <td>${lote.quantidade}</td>
        <td>${dias}</td>
        <td>
          <button onclick="removerLote(${pIndex}, ${lIndex})">❌</button>
        </td>
      `;

      tabela.appendChild(tr);
    });
  });
}


// ADICIONAR PRODUTO
// ADICIONAR PRODUTO
document.getElementById("produtoForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const local = document.getElementById("local").value.trim();
  const validade = document.getElementById("validade").value;
  const quantidade = Number(document.getElementById("quantidade").value);

  const produtos = getProdutos();

  // procura produto pelo código
  let produto = produtos.find(p => p.codigo === codigo);

  if (!produto) {
    // cria produto novo
    produtos.push({
      codigo,
      nome,
      lotes: [
        {
          validade,
          local,
          quantidade,
          notificado: false
        }
      ]
    });
  } else {
    // produto já existe → procurar lote
    let lote = produto.lotes.find(l => l.validade === validade);

    if (lote) {
      lote.quantidade += quantidade;
    } else {
      produto.lotes.push({
        validade,
        local,
        quantidade,
        notificado: false
      });
    }
  }

  saveProdutos(produtos);
  e.target.reset();
  renderProdutos();
  verificarNotificacoes();
});

// REMOVER
function removerLote(produtoIndex, loteIndex) {
  const produtos = getProdutos();
  produtos[produtoIndex].lotes.splice(loteIndex, 1);

  if (produtos[produtoIndex].lotes.length === 0) {
    produtos.splice(produtoIndex, 1);
  }

  saveProdutos(produtos);
  renderProdutos();
}

//CAMERA 
const botaoScan = document.getElementById("lerCodigo");

botaoScan.addEventListener("click", () => {
  console.log("clicou no scanner");

  // se existir input de busca, libera foco
  const busca = document.getElementById("buscaProduto");
  if (busca) busca.blur();

function abrirCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  })
  .then(stream => {
    streamAtual = stream; // ✅ GUARDA O STREAM

    const video = document.getElementById("video");
    const camera = document.getElementById("camera");

    if (!video || !camera) {
      console.error("Camera ou video não encontrado");
      return;
    }

    camera.style.display = "flex";
    video.srcObject = streamAtual;
    video.play();
  })
  .catch(err => {
    alert("Erro ao acessar a câmera: " + err.message);
    console.error(err);
  });
}


});

// FECHAR CAMERA

document.getElementById("fecharCamera").addEventListener("click", () => {
  const camera = document.getElementById("camera");
  const video = document.getElementById("video");
  const codigoInput = document.getElementById("codigo");

  if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop());
    streamAtual = null;
  }

  video.srcObject = null;
  camera.style.display = "none";

  // devolve foco para o formulário
  codigoInput.focus();
});

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
const btnLer = document.getElementById("lerCodigo");
const video = document.getElementById("camera");

if (btnLer) {
  btnLer.addEventListener("click", async () => {
    const codeReader = new ZXing.BrowserMultiFormatReader();

    video.style.display = "block";

    try {
      const result = await codeReader.decodeOnceFromVideoDevice(
        null,
        video
      );

      document.getElementById("codigo").value = result.text;

      navigator.vibrate?.(200);
      video.style.display = "none";
      codeReader.reset();

    } catch (err) {
      alert("Erro ao ler código");
      console.error(err);
    }
  });
}

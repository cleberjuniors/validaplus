// PEGAR USUÁRIOS OU CRIAR ARRAY VAZIO
function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

// SALVAR USUÁRIOS
function saveUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// CADASTRO
const cadastroForm = document.getElementById("cadastroForm");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarios = getUsuarios();

    const existe = usuarios.find(user => user.email === email);
    if (existe) {
      alert("Usuário já existe");
      return;
    }

    usuarios.push({ email, senha });
    saveUsuarios(usuarios);

    alert("Conta criada com sucesso");
    window.location.href = "login.html";
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const usuarios = getUsuarios();
    const user = usuarios.find(
      u => u.email === email && u.senha === senha
    );

    if (!user) {
      alert("Email ou senha inválidos");
      return;
    }

    localStorage.setItem("usuarioLogado", email);
    window.location.href = "dashboard.html";
  });
}

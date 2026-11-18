// URL base da API Express (back-end)
const API_URL = 'http://localhost:3000/clientes';

// Elementos da página
const form = document.getElementById('form-cliente');
const campoId = document.getElementById('cliente-id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoTelefone = document.getElementById('telefone');
const erroNome = document.getElementById('erro-nome');
const erroEmail = document.getElementById('erro-email');
const tituloForm = document.getElementById('titulo-form');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const lista = document.getElementById('lista-clientes');
const vazio = document.getElementById('vazio');
const contador = document.getElementById('contador');
const mensagem = document.getElementById('mensagem');

let clientes = [];
let temporizadorMensagem;

// ---------- Mensagens ao usuário ----------
function mostrarMensagem(texto, tipo = 'sucesso') {
  mensagem.textContent = texto;
  mensagem.className = 'mensagem ' + (tipo === 'sucesso' ? 'sucesso' : 'erro-msg');
  mensagem.hidden = false;
  clearTimeout(temporizadorMensagem);
  temporizadorMensagem = setTimeout(() => (mensagem.hidden = true), 5000);
}

// ---------- Requisições HTTP ----------
async function requisicao(url, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (e) {
    throw new Error('Falha de comunicação com a API. Verifique se o servidor está em execução.');
  }

  if (resposta.status === 204) return null;

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch (e) {
    /* resposta sem corpo JSON */
  }

  if (!resposta.ok) {
    throw new Error((corpo && corpo.erro) || `Erro ${resposta.status} ao processar a requisição.`);
  }
  return corpo;
}

async function carregarClientes() {
  try {
    clientes = await requisicao(API_URL); // GET /clientes
    renderizarLista();
  } catch (e) {
    clientes = [];
    renderizarLista();
    mostrarMensagem(e.message, 'erro');
  }
}

// ---------- Renderização (manipulação do DOM) ----------
function renderizarLista() {
  lista.innerHTML = '';
  contador.textContent = clientes.length;
  vazio.hidden = clientes.length > 0;

  clientes.forEach((c) => {
    const tr = document.createElement('tr');

    [c.id, c.nome, c.email, c.telefone || '-'].forEach((valor) => {
      const td = document.createElement('td');
      td.textContent = valor; // textContent evita injeção de HTML
      tr.appendChild(td);
    });

    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'celula-acoes';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => iniciarEdicao(c.id));

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-excluir';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirCliente(c.id));

    tdAcoes.append(btnEditar, btnExcluir);
    tr.appendChild(tdAcoes);
    lista.appendChild(tr);
  });
}

// ---------- Validação do formulário ----------
function validarFormulario() {
  let valido = true;
  erroNome.textContent = '';
  erroEmail.textContent = '';
  campoNome.classList.remove('invalido');
  campoEmail.classList.remove('invalido');

  if (!campoNome.value.trim()) {
    erroNome.textContent = 'Informe o nome.';
    campoNome.classList.add('invalido');
    valido = false;
  }

  const email = campoEmail.value.trim();
  if (!email) {
    erroEmail.textContent = 'Informe o e-mail.';
    campoEmail.classList.add('invalido');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erroEmail.textContent = 'E-mail inválido.';
    campoEmail.classList.add('invalido');
    valido = false;
  }

  return valido;
}

// ---------- Ações do CRUD ----------
async function salvarCliente(evento) {
  evento.preventDefault();
  if (!validarFormulario()) return;

  const dados = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    telefone: campoTelefone.value.trim(),
  };
  const id = campoId.value;

  try {
    if (id) {
      await requisicao(`${API_URL}/${id}`, {           // PUT /clientes/:id
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      mostrarMensagem('Cliente atualizado com sucesso!');
    } else {
      await requisicao(API_URL, {                      // POST /clientes
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      mostrarMensagem('Cliente cadastrado com sucesso!');
    }
    limparFormulario();
    await carregarClientes();
  } catch (e) {
    mostrarMensagem(e.message, 'erro');
    // Se o registro não existe mais, recarrega a lista
    if (id) await carregarClientes();
  }
}

function iniciarEdicao(id) {
  const c = clientes.find((x) => x.id === id);
  if (!c) return;
  campoId.value = c.id;
  campoNome.value = c.nome;
  campoEmail.value = c.email;
  campoTelefone.value = c.telefone || '';
  tituloForm.textContent = `Editando cliente #${c.id}`;
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.hidden = false;
  campoNome.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
  form.reset();
  campoId.value = '';
  tituloForm.textContent = 'Novo cliente';
  btnSalvar.textContent = 'Cadastrar';
  btnCancelar.hidden = true;
  erroNome.textContent = '';
  erroEmail.textContent = '';
  campoNome.classList.remove('invalido');
  campoEmail.classList.remove('invalido');
}

async function excluirCliente(id) {
  if (!confirm('Deseja realmente excluir este cliente?')) return;
  try {
    await requisicao(`${API_URL}/${id}`, { method: 'DELETE' }); // DELETE /clientes/:id
    mostrarMensagem('Cliente excluído com sucesso!');
    if (campoId.value === String(id)) limparFormulario();
  } catch (e) {
    mostrarMensagem(e.message, 'erro');
  }
  await carregarClientes();
}

// ---------- Eventos ----------
form.addEventListener('submit', salvarCliente);
btnCancelar.addEventListener('click', limparFormulario);
document.addEventListener('DOMContentLoaded', carregarClientes);

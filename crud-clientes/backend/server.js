const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'clientes.json');

app.use(cors());
app.use(express.json());

// ---------- Persistência simples em arquivo JSON ----------
function carregarClientes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function salvarClientes(clientes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clientes, null, 2), 'utf8');
}

let clientes = carregarClientes();
let proximoId = clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;

// ---------- Validação ----------
function validarCliente(corpo) {
  const erros = [];
  const nome = (corpo.nome || '').toString().trim();
  const email = (corpo.email || '').toString().trim();
  const telefone = (corpo.telefone || '').toString().trim();

  if (!nome) erros.push('O campo "nome" é obrigatório.');
  if (!email) {
    erros.push('O campo "email" é obrigatório.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.push('O campo "email" possui formato inválido.');
  }

  return { erros, dados: { nome, email, telefone } };
}

// ---------- Rotas ----------

// GET /clientes - listar todos
app.get('/clientes', (req, res) => {
  res.status(200).json(clientes);
});

// GET /clientes/:id - consultar um
app.get('/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) {
    return res.status(404).json({ erro: 'Cliente não encontrado.' });
  }
  res.status(200).json(cliente);
});

// POST /clientes - cadastrar
app.post('/clientes', (req, res) => {
  const { erros, dados } = validarCliente(req.body || {});
  if (erros.length) {
    return res.status(400).json({ erro: erros.join(' '), detalhes: erros });
  }

  const novo = { id: proximoId++, ...dados };
  clientes.push(novo);
  salvarClientes(clientes);
  res.status(201).json(novo);
});

// PUT /clientes/:id - atualizar
app.put('/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice === -1) {
    return res.status(404).json({ erro: 'Cliente não encontrado.' });
  }

  const { erros, dados } = validarCliente(req.body || {});
  if (erros.length) {
    return res.status(400).json({ erro: erros.join(' '), detalhes: erros });
  }

  clientes[indice] = { id, ...dados };
  salvarClientes(clientes);
  res.status(200).json(clientes[indice]);
});

// DELETE /clientes/:id - excluir
app.delete('/clientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = clientes.findIndex((c) => c.id === id);
  if (indice === -1) {
    return res.status(404).json({ erro: 'Cliente não encontrado.' });
  }

  clientes.splice(indice, 1);
  salvarClientes(clientes);
  res.status(204).send();
});

// JSON malformado e rotas inexistentes
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

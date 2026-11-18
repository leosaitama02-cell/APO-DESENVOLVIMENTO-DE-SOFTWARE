# APO-DESENVOLVIMENTO-DE-SOFTWARE

# Gerenciador de Clientes (CRUD)

Atividade Prática Orientada (APO) – Desenvolvimento Front-end / Back-end.

## Descrição

Aplicação web para cadastrar e administrar clientes. Permite **listar, cadastrar, editar e excluir** clientes. O front-end (HTML, CSS e JavaScript puro) se comunica com uma API REST (Node.js + Express.js) por meio de requisições HTTP com `fetch()`. Os dados são persistidos em um arquivo JSON (`backend/clientes.json`).

## Tecnologias

- **Front-end:** HTML5, CSS3, JavaScript (DOM, eventos, Fetch API)
- **Back-end:** Node.js, Express.js, CORS
- **Armazenamento:** arquivo JSON
- **Testes de API:** Postman / Insomnia / curl

## Estrutura do projeto

```
crud-clientes/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) instalado.

### 1. Back-end

```bash
cd backend
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`.

### 2. Front-end

Abra o arquivo `frontend/index.html` diretamente no navegador (ou use a extensão *Live Server* do VS Code). O back-end precisa estar em execução.

## Rotas da API

| Método | Rota             | Descrição                  | Sucesso          | Erros          |
| ------ | ---------------- | -------------------------- | ---------------- | -------------- |
| GET    | `/clientes`      | Lista todos os clientes    | 200              | –              |
| GET    | `/clientes/:id`  | Consulta um cliente        | 200              | 404            |
| POST   | `/clientes`      | Cadastra um novo cliente   | 201              | 400            |
| PUT    | `/clientes/:id`  | Atualiza um cliente        | 200              | 400, 404       |
| DELETE | `/clientes/:id`  | Exclui um cliente          | 204 (sem corpo)  | 404            |

### Corpo da requisição (POST e PUT)

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "(11) 91234-5678"
}
```

- `nome` e `email` são **obrigatórios**; o e-mail deve ter formato válido.
- `telefone` é opcional.

### Exemplo de resposta (201)

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "(11) 91234-5678"
}
```

### Exemplo de erro (400)

```json
{
  "erro": "O campo \"nome\" é obrigatório."
}
```

## Fluxo de comunicação (cliente-servidor)

1. O usuário preenche o formulário e clica em **Cadastrar**.
2. O JavaScript valida os campos e chama `fetch()` com o método HTTP correspondente (`POST`, `PUT`, `DELETE` ou `GET`).
3. A API Express recebe a requisição, valida os dados, altera o arquivo JSON e responde com JSON e um status HTTP.
4. O JavaScript lê a resposta, exibe mensagem de sucesso ou erro e recarrega a lista, atualizando o DOM.

## Testes de erro previstos

- Envio de nome ou e-mail vazios (validação no front-end e na API → 400).
- Alteração/exclusão de cliente inexistente (404).
- API fora do ar (mensagem de falha de comunicação no front-end).

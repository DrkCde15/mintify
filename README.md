# 🌿 Mintify - Marketplace de Infoprodutos

O **Mintify** é uma plataforma full-stack moderna para venda e gestão de produtos digitais, inspirada na Kiwify. Com uma interface limpa em tons de verde esmeralda, a plataforma permite que produtores gerenciem seus conteúdos, acompanhem vendas e administrem alunos de forma intuitiva.

## 🚀 Tecnologias

### Frontend

* **React.js (Vite)**: Performance e agilidade no desenvolvimento.
* **React Router DOM**: Navegação Single Page Application (SPA).
* **Lucide React**: Biblioteca de ícones modernos.
* **CSS3 Variables**: Design system baseado em variáveis para fácil manutenção.

### Backend

* **FastAPI (Python)**: Framework de alto desempenho para APIs.
* **SQLAlchemy**: ORM para comunicação com o banco de dados.
* **MySQL**: Banco de dados relacional para persistência de dados.
* **Pydantic**: Validação de dados e tipos.

---

## 📂 Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

* `/front-end`: Interface visual (React).
* `/back-end`: API e Banco de Dados (FastAPI).

---

## 🛠️ Como Rodar o Projeto

### 1. Pré-requisitos

* **Node.js** instalado.
* **Python 3.9+** instalado.
* **MySQL Server** rodando localmente (Crie um banco de dados chamado `mintify_db`).

### 2. Configurando o Backend (Servidor)

Abra um terminal na pasta raiz do projeto e execute:

```bash
# Entrar na pasta do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
source venv/bin/activate

# Instalar as dependências
pip install fastapi uvicorn sqlalchemy pymysql pydantic

# Iniciar o servidor
uvicorn main:app --reload

```

> O backend estará disponível em: `http://localhost:8000`

### 3. Configurando o Frontend (Interface)

Abra um **segundo terminal** na pasta raiz do projeto:

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar as dependências do Node
npm install

# Iniciar o ambiente de desenvolvimento
npm run dev

```

> O frontend estará disponível em: `http://localhost:5173`

---

## 🖼️ Funcionalidades Implementadas

* [x] **Home (Landing Page)**: Apresentação da marca Mintify.
* [x] **Autenticação**: Telas de Login e Cadastro integradas.
* [x] **Dashboard**: Resumo financeiro e métricas de desempenho.
* [x] **Meus Produtos**: Listagem e controle de status de infoprodutos.
* [x] **Financeiro**: Gestão de saldo e histórico de movimentações.
* [x] **Perfil**: Painel de edição de dados do produtor.

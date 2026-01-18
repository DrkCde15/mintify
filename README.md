# 🌿 Mintify - Marketplace de Infoprodutos

O **Mintify** é uma plataforma full-stack moderna para venda e gestão de produtos digitais. A plataforma oferece uma experiência completa desde o cadastro de usuários até a gestão avançada de vendas e de alunos.

## 🚀 Tecnologias

### Frontend

* **React.js (Vite)**: Performance e agilidade no desenvolvimento.
* **Axios**: Cliente HTTP configurado com **Interceptors** para anexar automaticamente o Token JWT.
* **Contexto de Autenticação**: Proteção de rotas privadas e persistência de sessão via `localStorage`.

### Backend

* **FastAPI (Python)**: Framework de alto desempenho para APIs assíncronas.
* **JWT (JSON Web Token)**: Sistema de segurança para autenticação e autorização de usuários.
* **SQLAlchemy & MySQL**: ORM robusto para persistência de dados relacionais.

---

## 🛠️ Configuração Inicial

### 1. Variáveis de Ambiente (.env)

Para segurança e flexibilidade, o projeto utiliza variáveis de ambiente. Crie um arquivo `.env` na raiz da pasta `/back-end`:

```env
# Banco de Dados
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/mintify_db

# Segurança (JWT)
SECRET_KEY=sua_chave_secreta_aqui_muito_longa
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

```

### 2. Configurando o Backend

```bash
cd back-end
python -m venv venv
# Ativar venv: Windows (venv\Scripts\activate) | Linux (source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload

```

### 3. Configurando o Frontend

```bash
cd front-end
npm install
npm install axios
npm run dev

```

---

## 📂 Estrutura do Projeto

O projeto é dividido em dois diretórios principais:

* `/front-end`: Interface visual (React + Vite).
* `/back-end`: API (FastAPI), Segurança e Banco de Dados.

---

## 🖼️ Funcionalidades Implementadas

* [x] **Sistema de Autenticação**: Login e Cadastro com senhas criptografadas.
* [x] **Configuração de Perfil**: Escolha entre Vendedor ou Aluno e cadastro de Chave PIX.
* [x] **Dashboard Dinâmico**: Consumo de dados reais do backend via rotas protegidas.
* [x] **Cadastro de Produtos**: Upload de arquivos (.zip, .pdf, vídeos) com armazenamento físico no servidor.
* [x] **Motor Financeiro**: Crédito automático na venda e débito no saque.
* [x] **Marketplace**: Design inspirado no Mercado Livre, com cards interativos.
* [x] **Biblioteca do Aluno**: Listagem exclusiva dos produtos comprados.
* [x] **Segurança**: Rotas protegidas e validação de saldo.
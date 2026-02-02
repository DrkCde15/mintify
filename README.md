# 🌿 Mintify - Marketplace de Infoprodutos e Produtos Físicos

O **Mintify** é uma plataforma full-stack moderna para venda e gestão de produtos **digitais e físicos**. A plataforma oferece uma experiência completa desde o cadastro de usuários até a gestão avançada de logística, vendas e de alunos.

## 🚀 Tecnologias

### Frontend

- **React.js (Vite)**: Performance e agilidade no desenvolvimento.
- **React Router DOM**: Gerenciamento de rotas e navegação na aplicação.
- **Axios**: Cliente HTTP configurado com **Interceptors** para anexar automaticamente o Token JWT.
- **Lucide React**: Biblioteca de ícones moderna e personalizável.
- **Contexto de Autenticação**: Proteção de rotas privadas e persistência de sessão via `localStorage`.

### Backend

- **FastAPI (Python)**: Framework de alto desempenho para APIs assíncronas.
- **Pydantic & Pydantic-Settings**: Validação de dados, serialização eficiente e gerenciamento de configurações centralizado.
- **SlowAPI**: Implementação de Rate Limiting para proteção contra abusos.
- **SQLAlchemy & MySQL**: ORM robusto com suporte a índices de performance e relacionamentos complexos.
- **Pillow**: Processamento e compressão automática de imagens (Conversão para WebP).
- **JWT (JSON Web Token)**: Autenticação e autorização segura.

---

## 🛠️ Configuração Inicial

### 1. Variáveis de Ambiente (.env)

Crie/atualize o arquivo `.env` na raiz da pasta `/back-end`:

```env
# Banco de Dados
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/mintify_db

# Segurança (JWT)
SECRET_KEY=sua_chave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# E-mail (Resend)
RESEND_API_KEY=re_sua_chave_aqui

# Configurações do App
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173

# Limites de Upload (MB)
MAX_IMAGE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=500
```

### 2. Configurando o Backend

```bash
cd back-end
python -m venv venv
# Ativar venv: Windows (venv\Scripts\activate)
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Configurando o Frontend

```bash
cd front-end
npm install
npm run dev
```

---

## 📂 Estrutura do Projeto

- `/front-end`: Interface visual responsiva e dashboards.
- `/back-end`: API, Processamento de Imagens, Lógica de Logística e Banco de Dados.

---

## 🖼️ Funcionalidades Implementadas

### ✅ Fase 1 - Segurança e Core

- [x] **Sistema de Autenticação**: Login e Cadastro seguro (bcrypt).
- [x] **Rate Limiting**: Proteção em todas as rotas críticas.
- [x] **Validação de Uploads**: Filtros rigorosos por tipo, tamanho e sanitização de nomes.
- [x] **Motor Financeiro**: Fluxo automático de créditos e débitos (Venda/Saque).
- [x] **Envio de E-mails**: Notificações automáticas via Resend.

### ✅ Fase 2 - Performance e Logística (Atual)

- [x] **Paginação Universal**: Implementada em Vitrine, Meus Cursos, Avaliações e Gestão de Alunos para otimização de carga.
- [x] **Otimização de Imagens**: Compressão automática e conversão para **WebP** no upload (uso de Pillow).
- [x] **Suporte a Produtos Físicos**: Controle de estoque, peso e dimensões.
- [x] **Gestão de Logística**: Cadastro de endereços no checkout e atualização de rastreio pelo vendedor.
- [x] **Banco de Dados Otimizado**: Adição de índices em colunas estratégicas para consultas rápidas.

---

## 🛤️ Próximos Passos (Roadmap)

- [ ] **Fase 3 - Qualidade**: Implementação de testes automatizados.
- [ ] **Fase 4 - Notificações**: Sistema in-app e alertas push.
- [ ] **Fase 5 - Integrações**: Cálculo automático de frete.
# 🌿 Mintify - Marketplace de Infoprodutos e Produtos Físicos

O **Mintify** é uma plataforma full-stack moderna para venda e gestão de produtos **digitais e físicos**. A plataforma oferece uma experiência completa desde o cadastro de usuários até a gestão avançada de logística, vendas e de alunos.

## 🚀 Tecnologias

### Frontend

- **Next.js (App Router)**: Framework React para produção com SSR, otimização de imagens e rotas avançadas.
- **TailwindCSS**: Estilização moderna e responsiva utilizando classes utilitárias.
- **Radix UI / Shadcn UI**: Componentes de interface acessíveis e altamente customizáveis.
- **Lucide React**: Biblioteca de ícones moderna.
- **Axios**: Cliente HTTP configurado para integração com o Backend FastAPI.
- **Zustand**: Gerenciamento de estado leve e eficiente.

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

# E-mail (SMTP)
EMAIL=seu_email@gmail.com
EMAIL_PASS_APP=sua_senha_de_app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=True

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

- [x] **Área de Membros Premium**: Experiência do aluno com player de vídeo, materiais de apoio e controle de progresso.
- [x] **Gestão de Notificações**: Alertas in-app e por e-mail para vendas e logística.
- [x] **Marketplace Híbrido**: Suporte a infoprodutos e e-commerce físico na mesma plataforma.
- [x] **Otimização Visual**: Processamento de imagens via servidor para garantir carregamento ultra-rápido.
---

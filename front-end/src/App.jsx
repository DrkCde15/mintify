import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  DollarSign, 
  User, 
  LogOut, 
  Store, 
  BookOpen 
} from 'lucide-react';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import EscolhaPerfil from './pages/EscolhaPerfil';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Alunos from './pages/Alunos';
import Financeiro from './pages/Financeiro';
import Perfil from './pages/Perfil';
import Marketplace from './pages/Marketplace'; // Importe o novo Marketplace
import PerfilAluno from './pages/PerfilAluno'; // Importe o novo PerfilAluno

// --- COMPONENTE DE PROTEÇÃO DE ROTA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- LAYOUT DO DASHBOARD DINÂMICO ---
function DashboardLayout({ children }) {
  const location = useLocation();
  
  // Pegamos o usuário logado para saber o perfil
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const ehVendedor = usuario.perfil === 'vendedor';

  const handleLogout = () => {
    localStorage.clear(); // Limpa tudo (token e usuário)
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">Mintify</div>
        <nav className="nav-links">
          {ehVendedor ? (
            /* MENU DO VENDEDOR */
            <>
              <Link to="/app" className={`nav-item ${location.pathname === '/app' ? 'active' : ''}`}>
                <LayoutDashboard size={20}/> Dashboard
              </Link>
              <Link to="/app/produtos" className={`nav-item ${location.pathname === '/app/produtos' ? 'active' : ''}`}>
                <Package size={20}/> Meus Produtos
              </Link>
              <Link to="/app/alunos" className={`nav-item ${location.pathname === '/app/alunos' ? 'active' : ''}`}>
                <Users size={20}/> Alunos
              </Link>
              <Link to="/app/financeiro" className={`nav-item ${location.pathname === '/app/financeiro' ? 'active' : ''}`}>
                <DollarSign size={20}/> Financeiro
              </Link>
              <Link to="/app/perfil" className={`nav-item ${location.pathname === '/app/perfil' ? 'active' : ''}`}>
                <User size={20}/> Perfil
              </Link>
            </>
          ) : (
            /* MENU DO ALUNO */
            <>
              <Link to="/app/marketplace" className={`nav-item ${location.pathname === '/app/marketplace' ? 'active' : ''}`}>
                <Store size={20}/> Mercado
              </Link>
              <Link to="/app/meus-cursos" className={`nav-item ${location.pathname === '/app/meus-cursos' ? 'active' : ''}`}>
                <BookOpen size={20}/> Meus Cursos
              </Link>
            </>
          )}
        </nav>
        
        <button onClick={handleLogout} className="nav-item logout-btn" style={{marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'}}>
          <LogOut size={20}/> Sair
        </button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  // Função auxiliar para decidir a página inicial do /app
  const getInitialRoute = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    return usuario.perfil === 'aluno' ? <Marketplace /> : <Dashboard />;
  };

  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        
        {/* Rota de Transição */}
        <Route path="/escolha-perfil" element={
          <ProtectedRoute>
            <EscolhaPerfil />
          </ProtectedRoute>
        } />

        {/* Rotas Privadas */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                {/* A rota index agora é inteligente: Aluno vê Marketplace, Vendedor vê Dashboard */}
                <Route index element={getInitialRoute()} />
                
                {/* Rotas de Vendedor */}
                <Route path="produtos" element={<Produtos />} />
                <Route path="alunos" element={<Alunos />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="perfil" element={<Perfil />} />

                {/* Rotas de Aluno */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="meus-cursos" element={<PerfilAluno />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
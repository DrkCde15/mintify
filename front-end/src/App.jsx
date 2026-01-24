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
import Login from './pages/Login';
import EscolhaPerfil from './pages/EscolhaPerfil';
import Vitrine from './pages/Vitrine'; 
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Alunos from './pages/Alunos';
import Financeiro from './pages/Financeiro';
import Perfil from './pages/Perfil';
import PerfilAluno from './pages/PerfilAluno';
import ProdutoDetalhe from './pages/ProdutoDetalhe'; // NOVO IMPORT
import Header from './components/Header'; // RE-ADD THIS IMPORT

// --- COMPONENTE DE PROTEÇÃO DE ROTA ---
// Verifica se o usuário está logado e se tem permissão para a rota
const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('access_token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const perfil = usuario.perfil || localStorage.getItem('perfil');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Bloqueia acesso se o perfil for diferente do exigido pela rota
  if (roleRequired && perfil !== roleRequired) {
    // Para alunos, redirecionar para a Vitrine se tentarem acessar rota de vendedor
    return <Navigate to={perfil === 'vendedor' ? '/app' : '/'} replace />; 
  }

  return children;
};

// --- LAYOUT DO DASHBOARD DINÂMICO ---
function DashboardLayout({ children }) {
  const location = useLocation();
  
  // Obtemos os dados do usuário para controle de menu
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const perfil = usuario.perfil || localStorage.getItem('perfil');
  const ehVendedor = perfil === 'vendedor';

  const handleLogout = () => {
    localStorage.clear();
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
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}> 
                <Store size={20}/> Vitrine
              </Link>
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
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}> 
                <Store size={20}/> Vitrine
              </Link>
              <Link to="/app/meus-cursos" className={`nav-item ${location.pathname === '/app/meus-cursos' ? 'active' : ''}`}>
                <BookOpen size={20}/> Meus Cursos
              </Link>
            </>
          )}
        </nav>
        
        <button onClick={handleLogout} className="nav-item logout-btn" style={{marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d'}}>
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
  // Função que decide qual página mostrar na rota "/app" baseada no perfil
  const getInitialRoute = () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const perfil = usuario.perfil || localStorage.getItem('perfil');
    
    // Se for vendedor, renderiza Dashboard. Se for aluno, redireciona para a Vitrine.
    return perfil === 'vendedor' ? <Dashboard /> : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          // Se o usuário estiver logado, renderiza a Vitrine com o DashboardLayout (e sidebar)
          // Caso contrário, renderiza a Vitrine como página pública (sem sidebar)
          localStorage.getItem('access_token') ? (
            <ProtectedRoute>
              <DashboardLayout><Vitrine /></DashboardLayout>
            </ProtectedRoute>
          ) : (
            <>
              <Header />
              <Vitrine />
            </>
          )
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/produto/:id" element={<ProdutoDetalhe />} /> {/* NOVA ROTA PÚBLICA */}
        
        {/* Rota de Transição para Novos Usuários */}
        <Route path="/escolha-perfil" element={
          <ProtectedRoute>
            <EscolhaPerfil />
          </ProtectedRoute>
        } />

        {/* Rotas Privadas Agrupadas */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                {/* Rota inicial dinâmica /app */}
                <Route index element={getInitialRoute()} />
                
                {/* Rotas restritas ao Vendedor */}
                <Route path="produtos" element={<ProtectedRoute roleRequired="vendedor"><Produtos /></ProtectedRoute>} />
                <Route path="alunos" element={<ProtectedRoute roleRequired="vendedor"><Alunos /></ProtectedRoute>} />
                <Route path="financeiro" element={<ProtectedRoute roleRequired="vendedor"><Financeiro /></ProtectedRoute>} />
                <Route path="perfil" element={<ProtectedRoute roleRequired="vendedor"><Perfil /></ProtectedRoute>} />

                {/* Rotas acessíveis ao Aluno */}
                {/* A rota "/app/marketplace" foi substituída pela rota "/" (Vitrine) */}
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
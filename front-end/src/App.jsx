import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, DollarSign, User, LogOut } from 'lucide-react';
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

// --- COMPONENTE DE PROTEÇÃO DE ROTA ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  // Se não houver token, manda de volta para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// --- LAYOUT DO DASHBOARD ---
function DashboardLayout({ children }) {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">Mintify</div>
        <nav className="nav-links">
          <Link to="/app" className="nav-item"><LayoutDashboard size={20}/> Dashboard</Link>
          <Link to="/app/produtos" className="nav-item"><Package size={20}/> Meus Produtos</Link>
          <Link to="/app/alunos" className="nav-item"><Users size={20}/> Alunos</Link>
          <Link to="/app/financeiro" className="nav-item"><DollarSign size={20}/> Financeiro</Link>
          <Link to="/app/perfil" className="nav-item"><User size={20}/> Perfil</Link>
        </nav>
        
        {/* Botão de Logout no final da sidebar */}
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
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        
        {/* Rota de Transição (Onboarding) - Protegida também */}
        <Route path="/escolha-perfil" element={
          <ProtectedRoute>
            <EscolhaPerfil />
          </ProtectedRoute>
        } />

        {/* Rotas Privadas (Envolvidas pela Proteção e pelo Layout) */}
        <Route path="/app/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="alunos" element={<Alunos />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="perfil" element={<Perfil />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
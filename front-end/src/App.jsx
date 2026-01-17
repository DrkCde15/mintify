import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Users, DollarSign, User } from 'lucide-react';
import './App.css';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Alunos from './pages/Alunos';
import Financeiro from './pages/Financeiro';
import Perfil from './pages/Perfil';

// Componente de Layout que contém a Sidebar
function DashboardLayout({ children }) {
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
        {/* Rotas Públicas (Sem Sidebar) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Privadas (Com Sidebar) - Note o /app antes */}
        <Route path="/app" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/app/produtos" element={<DashboardLayout><Produtos /></DashboardLayout>} />
        <Route path="/app/alunos" element={<DashboardLayout><Alunos /></DashboardLayout>} />
        <Route path="/app/financeiro" element={<DashboardLayout><Financeiro /></DashboardLayout>} />
        <Route path="/app/perfil" element={<DashboardLayout><Perfil /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
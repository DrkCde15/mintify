import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navbar Transparente */}
      <nav className="landing-nav">
        <div className="logo" style={{marginBottom: 0}}>Mintify</div>
        <div className="nav-actions">
          <Link to="/login" className="btn-text">Entrar</Link>
          <Link to="/cadastro" className="btn-primary">Começar Agora</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="badge-new">Novo: Taxa zero na primeira venda</span>
          <h1>Venda seus cursos online com a <span className="highlight">Mintify</span>.</h1>
          <p>A plataforma tudo-em-um para criadores de conteúdo. Hospede, venda e escale seu negócio digital sem complicação.</p>
          <div className="hero-buttons">
            <Link to="/cadastro" className="btn-primary btn-large">
              Criar conta grátis <ArrowRight size={20} />
            </Link>
          </div>
          <div className="hero-features">
            <span><CheckCircle size={16}/> Checkout de alta conversão</span>
            <span><CheckCircle size={16}/> Área de membros inclusa</span>
          </div>
        </div>
      </header>
    </div>
  );
}
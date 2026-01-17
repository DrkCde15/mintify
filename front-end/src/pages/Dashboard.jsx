// src/pages/Dashboard.jsx
import { DollarSign, Package, Users, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="fade-in">
      <header className="header">
        <div>
          <h1>Visão Geral</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Bem-vindo de volta, aqui está o que aconteceu hoje.</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn-secondary" style={{padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'white'}}>
            <Calendar size={20} />
          </button>
          <button className="btn-primary">Exportar Relatório</button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div><h3>Saldo Total</h3><p>R$ 15.000,00</p><span className="trend-up"><TrendingUp size={14}/> +12%</span></div>
          <div className="icon-container"><DollarSign size={24} color="var(--primary)" /></div>
        </div>
        {/* Outros cards... */}
      </section>

      <div className="dashboard-grid-large" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem'}}>
        <div className="table-container" style={{padding: '1.5rem'}}>
          <h2 style={{fontSize: '1.1rem', marginBottom: '1rem'}}>Vendas por Período</h2>
          <div style={{height: '200px', background: '#f9fafb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
            [Espaço para Gráfico de Barras - Futuro Recharts]
          </div>
        </div>
        
        <div className="table-container" style={{padding: '1.5rem'}}>
          <h2 style={{fontSize: '1.1rem', marginBottom: '1rem'}}>Top Produtos</h2>
          <div className="mini-list">
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)'}}>
              <span>React Pro</span>
              <strong>R$ 4.500</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0'}}>
              <span>Python Master</span>
              <strong>R$ 2.100</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
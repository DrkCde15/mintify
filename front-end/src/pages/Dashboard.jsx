import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import api from '../api'; // Importante: usa a instância com o Token JWT

export default function Dashboard() {
  const [stats, setStats] = useState({
    saldo_total: 0,
    vendas_hoje: 0,
    novos_alunos: 0
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        // Chamada para a rota protegida do FastAPI
        const response = await api.get('/api/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setErro("Não foi possível carregar as estatísticas.");
        
        // Se o erro for 401 (Não autorizado), o interceptor ou o App.jsx 
        // já devem tratar, mas podemos reforçar aqui se necessário.
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  if (carregando) return <div className="main-content">Carregando painel...</div>;

  if (erro) return <div className="main-content" style={{color: 'red'}}>{erro}</div>;

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Visão Geral</h1>
        <p style={{ color: '#64748b' }}>Bem-vindo de volta! Veja como estão seus resultados hoje.</p>
      </header>

      {/* Grid de Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Saldo Total</h3>
              <p>R$ {stats.saldo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> <span>+12.5% este mês</span>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Vendas Hoje</h3>
              <p>{stats.vendas_hoje}</p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0ea5e9' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            Última venda há 14 minutos
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Novos Alunos</h3>
              <p>{stats.novos_alunos}</p>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            Total de 1.240 alunos ativos
          </div>
        </div>
      </div>

      {/* Seção de Conteúdo Extra (Exemplo) */}
      <div className="card-white" style={{ marginTop: '2rem' }}>
        <h2>Atividades Recentes</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Nenhuma atividade suspeita detectada nas últimas 24h.</p>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { DollarSign, ArrowUpCircle, Clock, CheckCircle2, Wallet } from 'lucide-react';
import api from '../api';

export default function Financeiro() {
  const [dados, setDados] = useState({ saldo_total: 0, saldo_disponivel: 0, historico: [] });
  const [valorSaque, setValorSaque] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const carregarDadosFinanceiros = async () => {
    try {
      const res = await api.get('/api/financeiro/resumo');
      setDados(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("Erro ao carregar dados financeiros");
    }
  };

  const handleSaque = async (e) => {
    e.preventDefault();
    if (parseFloat(valorSaque) > dados.saldo_disponivel) return alert("Saldo insuficiente.");
    
    setEnviando(true);
    try {
      await api.post('/api/financeiro/saque', { valor: valorSaque, chave_pix: chavePix });
      alert("Solicitação de saque enviada com sucesso!");
      setValorSaque('');
      carregarDadosFinanceiros();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Erro ao solicitar saque.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="main-content fade-in">
      <h1>Financeiro</h1>

      {/* CARDS DE SALDO */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3>Saldo Total (Vendas)</h3>
          <p>R$ {dados.saldo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3483fa' }}>
          <h3>Disponível para Saque</h3>
          <p>R$ {dados.saldo_disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* FORMULÁRIO DE SAQUE */}
        <div className="card-white">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Wallet color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Solicitar Saque</h3>
          </div>
          <form onSubmit={handleSaque}>
            <div className="form-group">
              <label>Valor do Saque (R$)</label>
              <input type="number" step="0.01" required value={valorSaque} onChange={e => setValorSaque(e.target.value)} placeholder="0,00" />
            </div>
            <div className="form-group">
              <label>Chave PIX (CPF, E-mail ou Aleatória)</label>
              <input type="text" required value={chavePix} onChange={e => setChavePix(e.target.value)} placeholder="Sua chave aqui" />
            </div>
            <button className="btn-primary w-full" style={{ marginTop: '1rem' }} disabled={enviando || !valorSaque}>
              {enviando ? "Processando..." : "Solicitar Transferência"}
            </button>
          </form>
        </div>

        {/* HISTÓRICO DE MOVIMENTAÇÕES */}
        <div className="card-white">
          <h3 style={{ marginBottom: '1.5rem' }}>Últimas Movimentações</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.historico.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(h.data).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 500 }}>{h.tipo === 'venda' ? 'Venda' : 'Saque'}</td>
                    <td style={{ color: h.tipo === 'venda' ? 'var(--ml-green)' : '#ef4444' }}>
                      {h.tipo === 'venda' ? '+' : '-'} R$ {h.valor.toFixed(2)}
                    </td>
                    <td>
                      {h.status === 'concluido' ? (
                        <span style={{ color: 'var(--ml-green)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                          <CheckCircle2 size={14} /> Concluído
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                          <Clock size={14} /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../api';

export default function Financeiro() {
  const [financeiro, setFinanceiro] = useState({ saldo: 0, saques: [] });

  useEffect(() => {
    // Exemplo de chamada para buscar dados financeiros
    api.get('/api/financeiro')
      .then(res => setFinanceiro(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="main-content">
      <h1>Financeiro</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Disponível para saque</h3>
          <p>R$ {financeiro.saldo.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      {/* ... Restante da tabela de histórico usando api ... */}
    </div>
  );
}
// src/pages/Financeiro.jsx
export default function Financeiro() {
  return (
    <div className="fade-in">
      <header className="header">
        <h1>Financeiro</h1>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div><h3>Disponível para Saque</h3><p>R$ 8.420,00</p></div>
          <button className="btn-primary">Solicitar Saque</button>
        </div>
        <div className="stat-card">
          <div><h3>A receber (Próximos 30 dias)</h3><p>R$ 2.100,00</p></div>
        </div>
        <div className="stat-card">
          <div><h3>Total Recuperado</h3><p>R$ 540,00</p></div>
        </div>
      </section>

      <div className="table-container">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>
          <h2 style={{fontSize: '1.1rem'}}>Histórico de Saques</h2>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Conta de Destino</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>12/01/2026</td>
              <td>R$ 1.500,00</td>
              <td><span style={{color: '#10b981'}}>Concluído</span></td>
              <td>Banco do Brasil - ****1234</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
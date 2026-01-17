// src/pages/Produtos.jsx
export default function Produtos() {
  const produtos = [
    { id: 1, nome: "Curso de React Pro", tipo: "Curso Online", status: "Ativo", vendas: 45, preco: "R$ 497,00" },
    { id: 2, nome: "E-book Python Master", tipo: "E-book", status: "Rascunho", vendas: 0, preco: "R$ 97,00" },
  ];

  return (
    <div className="fade-in">
      <header className="header">
        <h1>Meus Produtos</h1>
        <button className="btn-primary">Novo Produto</button>
      </header>
      
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Vendas</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id}>
                <td style={{fontWeight: '600'}}>{p.nome}</td>
                <td style={{color: 'var(--text-muted)'}}>{p.tipo}</td>
                <td>
                  <span style={{
                    padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem',
                    background: p.status === 'Ativo' ? '#dcfce7' : '#f3f4f6',
                    color: p.status === 'Ativo' ? '#166534' : '#374151'
                  }}>{p.status}</span>
                </td>
                <td>{p.vendas}</td>
                <td>{p.preco}</td>
                <td><button className="btn-edit">Gerenciar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
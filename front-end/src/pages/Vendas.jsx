import { useEffect, useState } from 'react';
import { Truck, Search, Edit3, CheckCircle, Package, ExternalLink, X, HelpCircle } from 'lucide-react';
import api from '../api';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal de Logística
  const [modalAberto, setModalAberto] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [novoRastreio, setNovoRastreio] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchVendas(1);
  }, []);

  const fetchVendas = async (p = 1) => {
    setCarregando(true);
    try {
      const response = await api.get(`/api/vendedor/vendas?page=${p}&per_page=10`);
      setVendas(response.data.items || []);
      setTotalPages(response.data.total_pages || 1);
      setPage(response.data.page || 1);
      setTotalItems(response.data.total || 0);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const abrirLogistica = (venda) => {
    setVendaSelecionada(venda);
    setNovoStatus(venda.status_logistica || 'pendente_envio');
    setNovoRastreio(venda.codigo_rastreio || '');
    setModalAberto(true);
  };

  const handleUpdateLogistica = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
        const formData = new FormData();
        formData.append('status_logistica', novoStatus);
        formData.append('codigo_rastreio', novoRastreio);

        await api.patch(`/api/vendedor/vendas/${vendaSelecionada.id}`, formData);
        alert("Logística atualizada!");
        setModalAberto(false);
        fetchVendas(page);
    } catch (error) {
        alert("Erro ao atualizar!");
    } finally {
        setSalvando(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
        'pendente_envio': { label: 'Pendente', color: '#f59e0b' },
        'enviado': { label: 'Enviado', color: '#3b82f6' },
        'entregue': { label: 'Entregue', color: '#10b981' }
    };
    return map[status] || { label: status || 'Processando', color: '#64748b' };
  };

  return (
    <div className="main-content fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
            <h1>Minhas Vendas</h1>
            <p style={{ color: 'var(--text-muted)' }}>Você realizou <strong>{totalItems}</strong> vendas no total.</p>
        </div>
      </div>

      {carregando ? <p>Carregando vendas...</p> : (
        <div className="table-container card-white">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Status/Logística</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(v => (
                <tr key={v.id}>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(v.data_compra).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong>{v.produto.titulo}</strong>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{v.aluno_email}</td>
                  <td style={{ fontWeight: 600 }}>R$ {v.valor_pago.toFixed(2)}</td>
                  <td>
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: v.tipo_entrega_momento === 'fisico' ? '#dbeafe' : '#f0fdf4', color: v.tipo_entrega_momento === 'fisico' ? '#1e40af' : '#166534' }}>
                        {v.tipo_entrega_momento?.toUpperCase()}
                      </span>
                  </td>
                  <td>
                      {v.tipo_entrega_momento === 'fisico' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusLabel(v.status_logistica).color }}></div>
                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{getStatusLabel(v.status_logistica).label}</span>
                          </div>
                      ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Liberado</span>
                      )}
                  </td>
                  <td>
                      {v.tipo_entrega_momento === 'fisico' ? (
                          <button className="btn-pagination" onClick={() => abrirLogistica(v)} style={{ padding: '4px 8px' }}>
                              <Truck size={14} /> Logística
                          </button>
                      ) : (
                          <CheckCircle size={18} color="#10b981" />
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination" style={{ padding: '1rem' }}>
              <button onClick={() => fetchVendas(page - 1)} disabled={page === 1} className="btn-pagination">Anterior</button>
              <span className="page-info">Página {page} de {totalPages}</span>
              <button onClick={() => fetchVendas(page + 1)} disabled={page === totalPages} className="btn-pagination">Próxima</button>
            </div>
          )}
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={24} color="var(--primary)" />
                    <h3>Gerenciar Logística</h3>
                </div>
                <button onClick={() => setModalAberto(false)} className="btn-close-modal"><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Produto:</strong> {vendaSelecionada.produto.titulo}</p>
                <p style={{ margin: 0 }}><strong>Endereço de Entrega:</strong></p>
                <p style={{ margin: '4px 0', color: 'var(--text-muted)' }}>
                    {vendaSelecionada.logradouro}, {vendaSelecionada.numero} {vendaSelecionada.complemento && `(${vendaSelecionada.complemento})`}<br/>
                    {vendaSelecionada.bairro} - {vendaSelecionada.cidade}/{vendaSelecionada.estado}<br/>
                    CEP: {vendaSelecionada.cep}
                </p>
            </div>

            <form onSubmit={handleUpdateLogistica}>
                <div className="form-group">
                    <label>Status da Entrega</label>
                    <select value={novoStatus} onChange={e => setNovoStatus(e.target.value)}>
                        <option value="pendente_envio">Aguardando Envio</option>
                        <option value="enviado">Enviado / Em Trânsito</option>
                        <option value="entregue">Entregue</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Código de Rastreio</label>
                    <input type="text" placeholder="Ex: BR123456789" value={novoRastreio} onChange={e => setNovoRastreio(e.target.value)} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setModalAberto(false)} className="btn-pagination" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={salvando} style={{ flex: 2 }}>
                        {salvando ? "Salvando..." : "Atualizar Pedido"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

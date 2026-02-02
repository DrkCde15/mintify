import React, { useEffect, useState } from 'react';
import api from '../api';
import { BookOpen, User, Download, ExternalLink, PlayCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function PerfilAluno() {
  console.log('PerfilAluno component rendering...');
  const [usuario] = useState(JSON.parse(localStorage.getItem('usuario') || '{}'));
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const carregarMeusCursos = async (p = 1) => {
    console.log(`Carregando meus cursos (página ${p})...`);
    setCarregando(true);
    try {
      const res = await api.get(`/api/meus-cursos?page=${p}&per_page=6`);
      console.log('Meus cursos carregados:', res.data);
      setMeusProdutos(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Erro ao carregar seus produtos:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarMeusCursos(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      carregarMeusCursos(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Função para identificar o ícone baseado na extensão do arquivo
  const getIcon = (url) => {
    if (!url) return <BookOpen size={20} />;
    if (url.includes('.mp4') || url.includes('.mkv')) return <PlayCircle size={20} />;
    return <Download size={20} />;
  };

  return (
    <div className="main-content fade-in">
      {/* Cabeçalho de Perfil */}
      <div className="card-white" style={{ marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', borderLeft: '6px solid var(--primary)' }}>
        <div style={{ background: 'var(--primary-light)', padding: '1.2rem', borderRadius: '50%', color: 'var(--primary-dark)' }}>
            <User size={32} />
        </div>
        <div>
            <h2 style={{ margin: 0 }}>Olá, {usuario.nome}!</h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>{usuario.email} • <strong>Aluno Premium</strong></p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <BookOpen size={24} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Minha Biblioteca de Conteúdos</h2>
      </div>

      {carregando ? (
        <p>Carregando sua biblioteca...</p>
      ) : (
        <>
          <div className="stats-grid">
            {meusProdutos.length > 0 ? (
              meusProdutos.map(compra => {
                const p = compra.produto;
                // Encontrar arquivo principal se for digital
                const arquivoUrl = p.midias?.find(m => m.tipo === 'arquivo' || m.tipo === 'video')?.url;
                
                return (
                  <div key={compra.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span className="hero-badge" style={{ fontSize: '0.65rem', background: compra.tipo_entrega_momento === 'fisico' ? '#3b82f6' : 'var(--primary)' }}>
                          {compra.tipo_entrega_momento === 'fisico' ? 'FÍSICO' : 'DIGITAL'}
                        </span>
                        {getIcon(arquivoUrl)}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.titulo}</h3>
                      
                      {compra.tipo_entrega_momento === 'fisico' ? (
                          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                              <p style={{ margin: '0 0 5px 0', fontWeight: 600 }}>Status da Entrega:</p>
                              <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#cbd5e1', fontWeight: 700 }}>
                                  {compra.status_logistica?.replace('_', ' ') || 'Processando'}
                              </span>
                              {compra.codigo_rastreio && (
                                  <p style={{ margin: '10px 0 0 0' }}><strong>Código:</strong> {compra.codigo_rastreio}</p>
                              )}
                          </div>
                      ) : (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            {p.descricao || "Sem descrição disponível."}
                          </p>
                      )}
                    </div>

                    {compra.tipo_entrega_momento === 'digital' ? (
                        arquivoUrl ? (
                            <a 
                              href={`${API_BASE_URL}/${arquivoUrl}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-primary" 
                              style={{ 
                                width: '100%', 
                                textDecoration: 'none', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px',
                                fontSize: '0.9rem'
                              }}
                            >
                              <ExternalLink size={16} /> Acessar Conteúdo
                            </a>
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                                Conteúdo em processamento.
                            </p>
                        )
                    ) : (
                        <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            O vendedor atualizará o código de rastreio em breve.
                        </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="card-white" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <BookOpen size={48} style={{ opacity: 0.3 }} />
                </div>
                <h3>Você ainda não possui produtos.</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore o nosso mercado e comece a aprender agora mesmo!</p>
                <a href="/app/marketplace" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Ir para o Mercado
                </a>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="btn-pagination">Anterior</button>
              <span className="page-info">Página {page} de {totalPages}</span>
              <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="btn-pagination">Próxima</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
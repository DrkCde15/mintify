import React, { useEffect, useState } from 'react';
import api from '../api';
import { BookOpen, User, Download, ExternalLink, PlayCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function PerfilAluno() {
  console.log('PerfilAluno component rendering...'); // Debug log
  const [usuario] = useState(JSON.parse(localStorage.getItem('usuario') || '{}'));
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarMeusCursos = async () => {
      console.log('Carregando meus cursos...'); // Debug log
      try {
        const res = await api.get('/api/meus-cursos');
        console.log('Meus cursos carregados:', res.data); // Debug log
        setMeusProdutos(res.data);
      } catch (err) {
        console.error("Erro ao carregar seus produtos:", err); // Debug log
      } finally {
        setCarregando(false);
        console.log('Carregando cursos set to false.'); // Debug log
      }
    };
    carregarMeusCursos();
  }, []);

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
        <div className="stats-grid">
          {meusProdutos.length > 0 ? (
            meusProdutos.map(p => {
              console.log('Rendering meuProduto:', p); // Debug log
              return (
                <div key={p.id} className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span className="hero-badge" style={{ fontSize: '0.65rem' }}>ADQUIRIDO</span>
                      {getIcon(p.arquivo_url)}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.titulo}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      {p.descricao || "Sem descrição disponível."}
                    </p>
                  </div>

                  {p.arquivo_url ? (
                      <a 
                        href={`${API_BASE_URL}/${p.arquivo_url}`} 
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
                          Conteúdo indisponível.
                      </p>
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
      )}
    </div>
  );
}
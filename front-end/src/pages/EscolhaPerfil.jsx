import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../api';

export default function EscolhaPerfil() {
  const [tipo, setTipo] = useState(null); // 'aluno' ou 'vendedor'
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleFinalizar = async () => {
    if (!tipo) return alert("Por favor, selecione uma das opções.");

    setCarregando(true);
    try {
      // 1. Atualiza o perfil no Banco de Dados via API
      await api.put('/api/usuarios/completar-perfil', { perfil: tipo });

      // 2. Atualiza o localStorage para que a Sidebar e o App.jsx reconheçam o perfil
      const usuarioStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
      usuarioStorage.perfil = tipo;
      localStorage.setItem('usuario', JSON.stringify(usuarioStorage));

      // 3. Redirecionamento Inteligente
      if (tipo === 'aluno') {
        navigate('/app/marketplace');
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Houve um erro ao salvar sua escolha. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Como você deseja usar o Mintify?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Personalize sua experiência de acordo com seu objetivo.
        </p>

        <div className="perfil-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          {/* Opção ALUNO */}
          <div 
            className={`selection-card ${tipo === 'aluno' ? 'active' : ''}`}
            onClick={() => setTipo('aluno')}
            style={cardStyle(tipo === 'aluno')}
          >
            <div className="icon-circle" style={iconCircleStyle(tipo === 'aluno')}>
              <ShoppingCart size={32} />
            </div>
            <h3>Quero Comprar</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Acessar o marketplace, comprar cursos e materiais exclusivos.
            </p>
            {tipo === 'aluno' && <CheckCircle2 className="check-icon" style={checkStyle} />}
          </div>

          {/* Opção VENDEDOR */}
          <div 
            className={`selection-card ${tipo === 'vendedor' ? 'active' : ''}`}
            onClick={() => setTipo('vendedor')}
            style={cardStyle(tipo === 'vendedor')}
          >
            <div className="icon-circle" style={iconCircleStyle(tipo === 'vendedor')}>
              <LayoutDashboard size={32} />
            </div>
            <h3>Quero Vender</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cadastrar produtos digitais, gerenciar alunos e receber pagamentos.
            </p>
            {tipo === 'vendedor' && <CheckCircle2 className="check-icon" style={checkStyle} />}
          </div>
        </div>

        <button 
          className="btn-primary w-full" 
          disabled={!tipo || carregando} 
          onClick={handleFinalizar}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {carregando ? "Salvando..." : (
            <>Começar Agora <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

// --- ESTILOS INLINE PARA FACILITAR ---

const cardStyle = (isActive) => ({
  border: isActive ? '2px solid var(--primary)' : '2px solid var(--border)',
  borderRadius: '12px',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  position: 'relative',
  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
  transform: isActive ? 'scale(1.02)' : 'scale(1)'
});

const iconCircleStyle = (isActive) => ({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: isActive ? 'var(--primary)' : '#f3f4f6',
  color: isActive ? 'white' : 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem'
});

const checkStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  color: 'var(--primary)'
};
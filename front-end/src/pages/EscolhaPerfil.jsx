import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Store, Check, Loader2 } from 'lucide-react';
import api from '../api'; // Importação da instância configurada com JWT

export default function EscolhaPerfil() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [tipoProduto, setTipoProduto] = useState('videoaula');
  const [pix, setPix] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função genérica para enviar os dados ao Backend
  const salvarDadosNoBanco = async (dadosPerfil) => {
    setCarregando(true);
    try {
      // Chamada para a nova rota PUT que criamos no main.py
      await api.put('/api/usuarios/completar-perfil', dadosPerfil);
      
      // Se salvou com sucesso, vai para o app
      navigate('/app');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar suas configurações. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleEscolhaAluno = () => {
    salvarDadosNoBanco({
      perfil: 'Aluno',
      tipo_produto_interesse: 'Nenhum',
      chave_pix: ''
    });
  };

  const handleFinalizarVendedor = (e) => {
    e.preventDefault();
    if (!pix) {
      alert("Por favor, insira sua chave PIX.");
      return;
    }

    salvarDadosNoBanco({
      perfil: 'Vendedor',
      tipo_produto_interesse: tipoProduto,
      chave_pix: pix
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: passo === 1 ? '600px' : '450px' }}>
        
        {passo === 1 ? (
          <div className="selection-step">
            <div className="auth-header">
              <span className="logo">Mintify</span>
              <h3>Como você quer usar a plataforma?</h3>
              <p>Escolha seu perfil principal para começarmos.</p>
            </div>

            <div className="profile-grid">
              <button 
                type="button" 
                className="profile-opt" 
                onClick={handleEscolhaAluno}
                disabled={carregando}
              >
                <div className="icon-circle">
                  <GraduationCap size={32} />
                </div>
                <span>Sou Aluno</span>
                <p>Quero comprar cursos e acessar minha área de membros.</p>
              </button>

              <button 
                type="button" 
                className="profile-opt" 
                onClick={() => setPasso(2)}
                disabled={carregando}
              >
                <div className="icon-circle">
                  <Store size={32} />
                </div>
                <span>Sou Vendedor</span>
                <p>Quero cadastrar produtos e receber pagamentos via PIX.</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="config-step">
            <div className="auth-header">
              <span className="logo">Mintify</span>
              <h3>Configuração de Vendedor</h3>
              <p>Preencha os dados para ativar seu painel.</p>
            </div>

            <form className="auth-form" onSubmit={handleFinalizarVendedor}>
              <div className="form-group">
                <label>O que você vai vender?</label>
                <select 
                  className="custom-select" 
                  value={tipoProduto}
                  onChange={(e) => setTipoProduto(e.target.value)}
                  disabled={carregando}
                >
                  <option value="videoaula">Vídeo Aulas / Curso</option>
                  <option value="ebook">E-book (PDF)</option>
                  <option value="mentoria">Mentoria Individual</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sua Chave PIX (Para receber lucros)</label>
                <input 
                  type="text" 
                  placeholder="CPF, E-mail ou Telefone"
                  required
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  disabled={carregando}
                />
              </div>

              <button type="submit" className="btn-primary w-full" disabled={carregando}>
                {carregando ? (
                  <>Processando... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>Concluir Cadastro <Check size={18} /></>
                )}
              </button>
              
              {!carregando && (
                <button 
                  type="button" 
                  className="btn-text" 
                  style={{ marginTop: '1rem', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  onClick={() => setPasso(1)}
                >
                  Voltar
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // 1. Faz a chamada para o login no FastAPI
      const response = await api.post('/api/usuarios/login', {
        email: email,
        senha: senha
      });

      // 2. Extrai Token e dados do usuário (incluindo o perfil vindo do backend)
      const { access_token, usuario } = response.data;

      // 3. Salva no localStorage para as rotas protegidas e interceptors
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));

      // 4. REDIRECIONAMENTO INTELIGENTE:
      // Se o perfil já existe no banco, pula a configuração inicial
      if (usuario.perfil) {
        navigate('/app');
      } else {
        // Se é a primeira vez e o perfil está NULL, vai configurar
        navigate('/escolha-perfil');
      }
      
    } catch (err) {
      // Trata erros de credenciais ou conexão
      const mensagemErro = err.response?.data?.detail || 'E-mail ou senha incorretos.';
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="logo-area">
            <span className="logo">Mintify</span>
          </div>
          <h2>Bem-vindo de volta</h2>
          <p>Entre com suas credenciais para acessar o painel</p>
        </div>

        {erro && (
          <div className="error-badge" style={{ 
            backgroundColor: '#fee2e2', 
            color: '#b91c1c', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center',
            border: '1px solid #fecaca'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="Sua senha secreta"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full" 
            disabled={carregando}
          >
            {carregando ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 className="animate-spin" size={20} /> Entrando...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Acessar Conta <LogIn size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
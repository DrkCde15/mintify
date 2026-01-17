import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados para capturar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Por enquanto, apenas simulamos o login e navegamos para o dashboard
    console.log("Tentativa de login com:", email);
    
    // Redireciona para a área logada (Mintify App)
    navigate('/app');
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Link to="/" className="logo">Mintify</Link>
          <h3>Bem-vindo de volta</h3>
          <p>Insira suas credenciais para acessar sua conta.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              placeholder="seu@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Senha</label>
              <Link to="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Esqueceu a senha?
              </Link>
            </div>
            <input 
              type="password" 
              id="password"
              placeholder="********" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn-primary w-full">
            Entrar no Painel
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem uma conta? <Link to="/cadastro">Crie uma conta grátis</Link></p>
        </div>
      </div>
    </div>
  );
}
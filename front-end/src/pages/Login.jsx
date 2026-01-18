import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Login() {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/usuarios/login', formData);
      const { access_token, usuario } = response.data;

      // Salvando tudo que o App.jsx precisa
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('perfil', usuario.perfil);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Redirecionamento inteligente
      if (!usuario.perfil) {
        navigate('/escolha-perfil');
      } else {
        navigate('/app');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Email ou senha incorretos");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Bem-vindo de volta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" required onChange={e => setFormData({...formData, senha: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full">Entrar</button>
        </form>
        <p style={{marginTop: '1rem'}}>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
      </div>
    </div>
  );
}

export default Login;
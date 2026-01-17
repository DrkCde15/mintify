import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [erro, setErro] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await fetch('http://localhost:8000/api/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Conta criada com sucesso!");
        navigate('/login');
      } else {
        setErro(data.detail || "Erro ao cadastrar.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setErro("Servidor offline. Verifique o backend.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <Link to="/" className="logo">Mintify</Link>
          <h3>Crie sua conta</h3>
        </div>
        <form className="auth-form" onSubmit={handleCadastro}>
          {erro && <p style={{ color: 'red', fontSize: '0.8rem' }}>{erro}</p>}
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" required onChange={(e) => setFormData({...formData, nome: e.target.value})} />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" required onChange={(e) => setFormData({...formData, senha: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full">Cadastrar agora</button>
        </form>
        <div className="auth-footer">
          <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </div>
      </div>
    </div>
  );
}
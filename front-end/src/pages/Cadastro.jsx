import { Link } from 'react-router-dom';

export default function Cadastro() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="logo" style={{marginBottom: '1rem', textAlign: 'center'}}>Mintify</h2>
          <h3>Crie sua conta grátis</h3>
          <p>Junte-se a milhares de produtores digitais.</p>
        </div>
        
        <form className="auth-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" placeholder="Seu nome" />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" placeholder="Mínimo 8 caracteres" />
          </div>
          <button type="submit" className="btn-primary w-full">Criar Conta</button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta? <Link to="/login">Fazer Login</Link></p>
        </div>
      </div>
    </div>
  );
}
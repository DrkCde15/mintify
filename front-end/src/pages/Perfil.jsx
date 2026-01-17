import { User, Lock, Save } from 'lucide-react';

export default function Perfil() {
  return (
    <div className="fade-in">
      <header className="header">
        <h1>Meu Perfil</h1>
      </header>

      <div className="dashboard-grid-large" style={{maxWidth: '800px'}}>
        <div className="table-container" style={{padding: '2rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem'}}>
            <div style={{width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <User size={40} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{fontSize: '1.2rem'}}>Produtor Mintify</h3>
              <p style={{color: 'var(--text-muted)'}}>Alterar foto</p>
            </div>
          </div>

          <form className="auth-form">
            <div className="form-group">
              <label>Nome da Loja / Produtor</label>
              <input type="text" defaultValue="Produtor Mintify" />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" defaultValue="admin@mintify.com" disabled style={{background: '#f1f5f9'}} />
            </div>
            
            <h3 style={{marginTop: '2rem', marginBottom: '1rem', display: 'flex', gap: '8px'}}><Lock size={18}/> Segurança</h3>
            
            <div className="form-group">
              <label>Nova Senha</label>
              <input type="password" placeholder="Deixe em branco para manter" />
            </div>

            <button className="btn-primary" style={{marginTop: '1rem'}}>
              <Save size={18} /> Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
// src/pages/Alunos.jsx
import { Users } from 'lucide-react';
export default function Alunos() {
  return (
    <div className="fade-in">
      <header className="header">
        <h1>Gestão de Alunos</h1>
        <div style={{display: 'flex', gap: '1rem'}}>
          <input type="text" placeholder="Buscar por email ou nome..." 
            style={{padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '300px'}} />
        </div>
      </header>
      
      <div className="empty-state">
        <Users size={48} style={{marginBottom: '1rem', opacity: 0.2}} />
        <p>Nenhum aluno encontrado com esses filtros.</p>
        <small>Seus alunos aparecerão aqui assim que as vendas forem aprovadas.</small>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import api from '../api';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    api.get('/api/alunos')
      .then(response => setAlunos(response.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="main-content">
      <h1>Gestão de Alunos</h1>
      <div className="card-white">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Data de Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.email}</td>
                <td>{new Date(aluno.data_criacao).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
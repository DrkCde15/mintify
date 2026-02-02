import { useEffect, useState } from 'react';
import api from '../api';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAlunos = (p = 1) => {
    setLoading(true);
    api.get(`/api/alunos?page=${p}&per_page=10`)
      .then(response => {
        setAlunos(response.data.items || []);
        setTotalPages(response.data.total_pages || 1);
        setPage(response.data.page || 1);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlunos(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAlunos(newPage);
    }
  };

  return (
    <div className="main-content">
      <h1>Gestão de Alunos</h1>
      <div className="card-white" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <p>Carregando alunos...</p>
        ) : (
          <>
            <table style={{ flex: 1 }}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length > 0 ? alunos.map(aluno => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.email}</td>
                    <td>{aluno.data_criacao ? new Date(aluno.data_criacao).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum aluno encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="btn-pagination">Anterior</button>
                <span className="page-info">Página {page} de {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="btn-pagination">Próxima</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
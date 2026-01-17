import { useEffect, useState } from 'react';
import api from '../api'; // Importação da instância configurada

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/api/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setCarregando(false);
      }
    };
    fetchProdutos();
  }, []);

  return (
    <div className="main-content">
      <h1>Meus Produtos</h1>
      {carregando ? <p>Carregando...</p> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Vendas</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td>{p.titulo}</td>
                  <td>{p.tipo}</td>
                  <td>R$ {p.preco.toFixed(2)}</td>
                  <td>{p.vendas_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import api from '../api';

function Marketplace() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    api.get('/api/produtos').then(res => setProdutos(res.data));
  }, []);

  const handleCompra = async (produtoId) => {
    try {
      await api.post(`/api/produtos/comprar/${produtoId}`);
      alert("Compra realizada! O produto já está em 'Meus Cursos'.");
    } catch (error) {
      alert(error.response?.data?.detail || "Erro na compra");
    }
  };

  return (
    <div>
      <h1>Mercado de Ofertas</h1>
      <div className="marketplace-grid">
        {produtos.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-image-container">
              <img src={`http://127.0.0.1:8000/${p.imagem_url}`} alt={p.titulo} className="product-image" />
            </div>
            <div className="product-details">
              <span className="badge-promo">Oferta do Dia</span>
              <h3 className="product-title">{p.titulo}</h3>
              <div className="price-section">
                <span className="price-value">R$ {p.preco.toFixed(2)}</span>
                <span className="installment">em 10x sem juros</span>
                <button 
                  onClick={() => handleCompra(p.id)}
                  className="btn-primary" 
                  style={{marginTop: '10px', fontSize: '14px'}}
                >
                  Comprar Agora
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace;
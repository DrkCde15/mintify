import React, { useEffect, useState } from 'react';
import api from '../api';
import { X, CheckCircle, ShieldCheck, Truck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function Marketplace() {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null); // Estado para o Modal

  useEffect(() => {
    api.get('/api/produtos').then(res => setProdutos(res.data));
  }, []);

  const handleComprar = async (id) => {
    try {
      await api.post(`/api/produtos/comprar/${id}`);
      alert("Sucesso! O conteúdo já está disponível em 'Meus Cursos'.");
      setProdutoSelecionado(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Erro na compra");
    }
  };

  return (
    <div className="main-content fade-in" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Mercado de Ofertas</h1>
      
      <div className="marketplace-grid">
        {produtos.map(p => (
          <div key={p.id} className="product-card" onClick={() => setProdutoSelecionado(p)}>
            <div className="product-image-container">
              <img src={`${API_BASE_URL}/${p.imagem_url}`} alt={p.titulo} className="product-image" />
            </div>
            <div className="product-details">
              <span className="badge-promo">OFERTA DO DIA</span>
              <h3 className="product-title">{p.titulo}</h3>
              <div className="price-section">
                <span className="price-value">R$ {parseFloat(p.preco).toFixed(2)}</span>
                <span className="installment">em 10x sem juros</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE DETALHES */}
      {produtoSelecionado && (
        <div className="modal-overlay" onClick={() => setProdutoSelecionado(null)}>
          <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setProdutoSelecionado(null)}><X /></button>
            
            <div className="product-modal-body">
              <div className="product-modal-image">
                <img src={`${API_BASE_URL}/${produtoSelecionado.imagem_url}`} alt={produtoSelecionado.titulo} />
              </div>
              
              <div className="product-modal-info">
                <span className="hero-badge">Novo | +100 vendidos</span>
                <h2>{produtoSelecionado.titulo}</h2>
                
                <div className="price-tag">
                  <span className="currency">R$</span>
                  <span className="amount">{parseFloat(produtoSelecionado.preco).toFixed(2)}</span>
                </div>
                
                <p className="product-description">{produtoSelecionado.descricao}</p>
                
                <div className="benefits-list">
                  <div className="benefit-item"><Truck size={18} /> <span>Entrega digital imediata via e-mail</span></div>
                  <div className="benefit-item"><ShieldCheck size={18} /> <span>Compra Garantida com o Mintify</span></div>
                </div>

                <button className="btn-primary w-full btn-lg" onClick={() => handleComprar(produtoSelecionado.id)}>
                  Comprar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
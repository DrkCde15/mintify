import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';
import { Star, MessageSquare, User, DollarSign, Package } from 'lucide-react';
import Header from '../components/Header'; // <--- NEW IMPORT

const ProdutoDetalhe = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState('');
    const [newReview, setNewReview] = useState({ nota: 0, comentario: '' });
    const [reviewError, setReviewError] = useState(null);
    const [userBoughtProduct, setUserBoughtProduct] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userPerfil, setUserPerfil] = useState('');

    useEffect(() => {
        console.log('ProdutoDetalhe: useEffect started, id:', id); // LOG 1

        if (!id || isNaN(parseInt(id))) {
            console.log('ProdutoDetalhe: Invalid ID, redirecting to /vitrine. ID:', id); // LOG 2
            navigate('/vitrine');
            return;
        }

        const token = localStorage.getItem('access_token');
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (token && usuario) {
            setIsLoggedIn(true);
            setUserPerfil(usuario.perfil);
        }

        const fetchProductAndReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                const productRes = await api.get(`/api/produtos/${id}`);
                console.log('ProdutoDetalhe: API response for product:', productRes.data); // LOG 3
                setProduct(productRes.data);

                if (productRes.data.midias && productRes.data.midias.length > 0) {
                    const imageUrl = `http://localhost:8000/${productRes.data.midias[0].url}`;
                    console.log('ProdutoDetalhe: Setting currentImage to:', imageUrl); // LOG 4
                    setCurrentImage(imageUrl);
                } else {
                    console.log('ProdutoDetalhe: No midias found for product.'); // LOG 5
                }

                // Fetch product reviews
                const reviewsRes = await api.get(`/api/produtos/${id}/avaliacoes`);
                setReviews(reviewsRes.data);

                // Check if logged-in user bought this product
                if (isLoggedIn && usuario.perfil === 'aluno') {
                    const meusCursosRes = await api.get('/api/meus-cursos');
                    const bought = meusCursosRes.data.some(course => course.id === parseInt(id));
                    setUserBoughtProduct(bought);
                }

            } catch (err) {
                setError('Falha ao carregar detalhes do produto.');
                console.error('Erro ao buscar produto ou avaliações:', err); // LOG 6
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndReviews();
    }, [id, isLoggedIn, userPerfil, navigate]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError(null);
        if (newReview.nota === 0) {
            setReviewError('Por favor, dê uma nota de 1 a 5.');
            return;
        }
        try {
            await api.post('/api/avaliacoes', {
                produto_id: parseInt(id),
                nota: newReview.nota,
                comentario: newReview.comentario,
            });
            setNewReview({ nota: 0, comentario: '' });
            // Re-fetch reviews to show the new one
            const reviewsRes = await api.get(`/api/produtos/${id}/avaliacoes`);
            setReviews(reviewsRes.data);
        } catch (err) {
            setReviewError(err.response?.data?.detail || 'Erro ao enviar avaliação.');
            console.error('Erro ao enviar avaliação:', err);
        }
    };

    const handleBuyProduct = async () => {
        try {
            await api.post(`/api/produtos/comprar/${id}`);
            alert('Produto comprado com sucesso!');
            navigate('/app/meus-cursos'); // Redireciona para Meus Cursos após a compra
        } catch (err) {
            alert(err.response?.data?.detail || 'Erro ao comprar o produto.');
            console.error('Erro ao comprar produto:', err);
        }
    };

    if (loading) return <p>Carregando produto...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!product) return <p>Produto não encontrado.</p>;

    const isSeller = isLoggedIn && userPerfil === 'vendedor' && product.vendedor_email === JSON.parse(localStorage.getItem('usuario') || '{}').email;

    const getStarRating = (nota) => {
        return Array(5).fill(0).map((_, i) => (
            <Star key={i} size={16} fill={i < nota ? "gold" : "none"} stroke="gold" />
        ));
    };

    return (
        <> {/* Use a fragment or a div */}
            <Header /> {/* <--- NEW HEADER COMPONENT */}
            <div className="product-detail-container">
                <button onClick={() => navigate(-1)} className="btn-text back-button">
                    &larr; Voltar
                </button>
                
                <div className="product-header">
                    <div className="product-media">
                        <img src={currentImage} alt={product.titulo} className="main-media" />
                        <div className="media-thumbnail-list">
                            {product.midias.map((media, index) => {
                                const thumbnailUrl = `http://localhost:8000/${media.url}`;
                                console.log('ProdutoDetalhe: Thumbnail URL:', thumbnailUrl, 'for media:', media); // LOG 7
                                return (
                                    <img 
                                        key={index} 
                                        src={thumbnailUrl} 
                                        alt={`Thumbnail ${index}`} 
                                        className={`thumbnail ${currentImage === thumbnailUrl ? 'active' : ''}`}
                                        onClick={() => setCurrentImage(thumbnailUrl)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="product-info">
                        <h1 className="product-title">{product.titulo}</h1>
                        <p className="product-price">R$ {product.preco.toFixed(2)}</p>
                        <div className="product-meta">
                            <p><User size={16}/> Vendedor: {product.vendedor_email}</p>
                            <p><Package size={16}/> Tipo: {product.tipo}</p>
                        </div>
                        <p className="product-description">{product.descricao}</p>
                        {isLoggedIn && userPerfil === 'aluno' && !userBoughtProduct && !isSeller && (
                            <button onClick={handleBuyProduct} className="btn-primary w-full mt-4">Comprar Produto</button>
                        )}
                        {!isLoggedIn && (
                            <p className="info-message mt-4">Faça login como aluno para comprar este produto.</p>
                        )}
                        {isLoggedIn && userPerfil === 'aluno' && userBoughtProduct && (
                            <p className="info-message mt-4">Você já comprou este produto.</p>
                        )}
                        {isLoggedIn && userPerfil === 'vendedor' && (
                            <p className="info-message mt-4">Vendedores não podem comprar produtos na vitrine.</p>
                        )}
                        {isSeller && (
                            <p className="info-message mt-4">Você é o vendedor deste produto.</p>
                        )}
                    </div>
                </div>

                <div className="product-reviews">
                    <h2>Avaliações dos Clientes ({reviews.length})</h2>
                    {reviews.length === 0 && <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>}
                    
                    <div className="review-list">
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <span className="review-author">{review.aluno.nome}</span>
                                    <div className="review-stars">{getStarRating(review.nota)}</div>
                                </div>
                                <p className="review-comment">{review.comentario || 'Sem comentário.'}</p>
                                <span className="review-date">{new Date(review.data_avaliacao).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>

                    {isLoggedIn && userPerfil === 'aluno' && userBoughtProduct && (
                        <div className="review-form-container">
                            <h3>Deixe sua avaliação</h3>
                            <form onSubmit={handleReviewSubmit} className="review-form">
                                <div className="form-group">
                                    <label>Nota:</label>
                                    <select 
                                        value={newReview.nota} 
                                        onChange={(e) => setNewReview({ ...newReview, nota: parseInt(e.target.value) })}
                                    >
                                        <option value="0">Selecione</option>
                                        <option value="1">1 Estrela</option>
                                        <option value="2">2 Estrelas</option>
                                        <option value="3">3 Estrelas</option>
                                        <option value="4">4 Estrelas</option>
                                        <option value="5">5 Estrelas</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Comentário (opcional):</label>
                                    <textarea
                                        value={newReview.comentario}
                                        onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                                        rows="4"
                                        placeholder="Escreva seu comentário..."
                                    ></textarea>
                                </div>
                                {reviewError && <p className="error-message">{reviewError}</p>}
                                <button type="submit" className="btn-primary">Enviar Avaliação</button>
                            </form>
                        </div>
                    )}
                    {!isLoggedIn && <p className="info-message">Faça login para poder avaliar este produto.</p>}
                    {isLoggedIn && userPerfil === 'aluno' && !userBoughtProduct && <p className="info-message">Compre este produto para poder deixar uma avaliação.</p>}
                </div>
            </div>
        </>
    );
};

export default ProdutoDetalhe;
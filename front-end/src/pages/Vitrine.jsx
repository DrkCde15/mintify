import React, { useEffect, useState } from 'react';
import api from '../api'; // Import the configured axios instance
import '../App.css'; // For basic styling
import { Search, DollarSign, Tag } from 'lucide-react'; // Icons for input fields
import Header from '../components/Header'; // Re-add import - KEEP THIS IMPORT FOR NOW TO AVOID OTHER ISSUES
import { Link } from 'react-router-dom'; // Add Link import

const Vitrine = () => {
    console.log('Vitrine component rendering...'); // Debug log

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [productType, setProductType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const isLoggedIn = localStorage.getItem('access_token');

    const fetchProducts = async (page = 1) => {
        console.log(`Fetching products (page ${page})...`);
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('per_page', '12');

            if (searchTerm) params.append('q', searchTerm);
            
            if (minPrice !== '') {
                const parsedMinPrice = parseFloat(minPrice);
                if (!isNaN(parsedMinPrice)) params.append('min_preco', String(parsedMinPrice));
            }

            if (maxPrice !== '') {
                const parsedMaxPrice = parseFloat(maxPrice);
                if (!isNaN(parsedMaxPrice)) params.append('max_preco', String(parsedMaxPrice));
            }
            
            if (productType) params.append('tipo', productType);

            const response = await api.get(`/api/produtos/buscar?${params.toString()}`);
            console.log('Products fetched:', response.data);
            
            // Backend returns { items, total, page, per_page, total_pages }
            setProducts(response.data.items || []);
            setTotalPages(response.data.total_pages || 1);
            setTotalItems(response.data.total || 0);
            setCurrentPage(response.data.page || 1);
        } catch (err) {
            setError('Falha ao carregar produtos.');
            console.error('Erro ao buscar produtos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage);
            window.scrollTo(0, 0);
        }
    };

    return (
        <>
            <div className="vitrine-container">
                <h1 className="vitrine-title">Explore nossos produtos</h1>

                <form onSubmit={handleSearch} className="search-filter-form">
                    <div className="input-group">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por título ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <DollarSign size={20} />
                        <input
                            type="number"
                            placeholder="Preço mínimo"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <DollarSign size={20} />
                        <input
                            type="number"
                            placeholder="Preço máximo"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <Tag size={20} />
                        <input
                            type="text"
                            placeholder="Tipo de produto"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary">Buscar</button>
                </form>

                <div className="vitrine-stats">
                    {!loading && <p>{totalItems} produtos encontrados</p>}
                </div>

                {loading && <p>Carregando produtos...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="product-list">
                    {products.length === 0 && !loading && !error && <p>Nenhum produto encontrado.</p>}
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <Link to={`/produto/${product.id}`}>
                                {product.midias && product.midias.length > 0 && (
                                    <img
                                        src={`http://localhost:8000/${product.midias[0].url}`}
                                        alt={product.titulo}
                                        className="product-image"
                                    />
                                )}
                                <h3>{product.titulo}</h3>
                                <p>{product.descricao}</p>
                                <p className="product-price">R$ {product.preco != null ? product.preco.toFixed(2) : '0.00'}</p>
                                <p className="product-type">Tipo: {product.tipo}</p>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn-pagination"
                        >
                            Anterior
                        </button>
                        <span className="page-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn-pagination"
                        >
                            Próxima
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Vitrine;

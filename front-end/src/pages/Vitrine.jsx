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
    const [maxPrice, setMaxPrice] = useState(''); // Correctly declared setMaxPrice
    const [productType, setProductType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isLoggedIn = localStorage.getItem('access_token'); // Check login status

    const fetchProducts = async () => {
        console.log('Fetching products...'); // Debug log
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('q', searchTerm);
            }
            
            if (minPrice !== '') {
                const parsedMinPrice = parseFloat(minPrice);
                if (!isNaN(parsedMinPrice)) {
                    params.append('min_preco', String(parsedMinPrice));
                }
            }

            // Corrected: use maxPrice state variable for filtering
            if (maxPrice !== '') {
                const parsedMaxPrice = parseFloat(maxPrice);
                if (!isNaN(parsedMaxPrice)) {
                    params.append('max_preco', String(parsedMaxPrice));
                }
            }
            
            if (productType) {
                params.append('tipo', productType);
            }

            const response = await api.get(`/api/produtos/buscar?${params.toString()}`);
            console.log('Products fetched:', response.data); // Debug log
            setProducts(response.data);
        } catch (err) {
            setError('Falha ao carregar produtos.');
            console.error('Erro ao buscar produtos:', err); // Debug log
        } finally {
            setLoading(false);
            console.log('Loading set to false.'); // Debug log
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []); // Fetch on initial load, no dependencies as filters are applied via button

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    return (
        <>
            {/* Removed conditional Header rendering from Vitrine - now handled by App.jsx */}

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

                {loading && <p>Carregando produtos...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="product-list">
                    {products.length === 0 && !loading && !error && <p>Nenhum produto encontrado.</p>}
                    {products.map((product) => {
                        console.log('Rendering product:', product); // Debug log
                        return product.id && (
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
                                    <p>R$ {product.preco != null ? product.preco.toFixed(2) : 'N/A'}</p> {/* Safe check */}
                                    <p>Tipo: {product.tipo}</p>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Vitrine;

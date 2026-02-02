import { useEffect, useState } from 'react';
import { Plus, X, Upload, FileText, Image as ImageIcon, Loader2, Video } from 'lucide-react'; // Adicionado Video icon
import api from '../api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ titulo: '', preco: '', descricao: '' });
  
  // Estados para os arquivos (agora múltiplos) e tipo de produto
  const [imagens, setImagens] = useState([]);
  const [arquivos, setArquivos] = useState([]); // Pode incluir PDFs, vídeos, etc.
  const [tipoProduto, setTipoProduto] = useState('Curso Online'); // Novo estado
  const [tipoEntrega, setTipoEntrega] = useState('digital'); // 'digital' ou 'fisico'
  const [estoque, setEstoque] = useState(0);
  const [dimensoes, setDimensoes] = useState({ peso: '', largura: '', altura: '', comprimento: '' });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      // Endpoint de produtos agora retorna com mídias
      const response = await api.get('/api/produtos');
      // Tratar se vier objeto paginado ou array
      const data = response.data.items || response.data;
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setCarregando(false);
    }
  };

  const handleImageChange = (e) => {
    setImagens(Array.from(e.target.files));
  };

  const handleFileChange = (e) => {
    setArquivos(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (imagens.length === 0) return alert("Selecione pelo menos uma imagem para a vitrine.");
    if (tipoEntrega === 'digital' && arquivos.length === 0) return alert("Produtos digitais precisam de pelo menos um arquivo.");

    setEnviando(true);
    
    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('preco', form.preco);
    formData.append('descricao', form.descricao);
    formData.append('tipo_produto', tipoProduto); // Adicionado o tipo de produto
    formData.append('tipo_entrega', tipoEntrega);
    
    if (tipoEntrega === 'fisico') {
        formData.append('estoque', estoque);
        formData.append('peso_kg', dimensoes.peso);
        formData.append('largura_cm', dimensoes.largura);
        formData.append('altura_cm', dimensoes.altura);
        formData.append('comprimento_cm', dimensoes.comprimento);
    }

    imagens.forEach((file) => {
      formData.append('imagens', file);
    });

    arquivos.forEach((file) => {
      formData.append('arquivos', file);
    });

    try {
      await api.post('/api/produtos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Produto cadastrado com sucesso!");
      fecharModal();
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao carregar produto:", error.response?.data?.detail || error.message);
      alert("Erro ao cadastrar produto: " + (error.response?.data?.detail || "Verifique os dados."));
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setForm({ titulo: '', preco: '', descricao: '' });
    setImagens([]);
    setArquivos([]);
    setTipoProduto('Curso Online');
    setTipoEntrega('digital');
    setEstoque(0);
    setDimensoes({ peso: '', largura: '', altura: '', comprimento: '' });
  };

  // Helper para exibir nomes dos arquivos selecionados
  const getFileNames = (fileList) => fileList.map(f => f.name).join(', ') || 'Nenhum arquivo selecionado.';

  return (
    <div className="main-content fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Meus Produtos à Venda</h1>
        <button className="btn-primary" onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {carregando ? <p>Carregando...</p> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Entrega</th>
                <th>Estoque</th>
                <th>Vendas</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {p.midias && p.midias.length > 0 && (
                        <img src={`http://localhost:8000/${p.midias[0].url}`} alt={p.titulo} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                    )}
                    <strong>{p.titulo}</strong>
                  </td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td style={{textTransform: 'capitalize'}}>{p.tipo_entrega}</td>
                  <td>{p.tipo_entrega === 'fisico' ? p.estoque : '∞'}</td>
                  <td>{p.vendas_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="modal-header">
              <h3>Cadastrar Novo Produto</h3>
              <button onClick={fecharModal} className="btn-close-modal"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} className="auth-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Título do Produto</label>
                    <input type="text" required placeholder="Ex: Suplemento Whey" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Preço de Venda (R$)</label>
                    <input type="number" step="0.01" required placeholder="0,00" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} />
                  </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows="2" required placeholder="Explique os benefícios deste produto" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} 
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Categoria</label>
                    <select value={tipoProduto} onChange={e => setTipoProduto(e.target.value)}>
                        <option value="Suplemento">Suplemento</option>
                        <option value="Curso Online">Curso Online</option>
                        <option value="E-book">E-book</option>
                        <option value="Equipamento">Equipamento</option>
                        <option value="Vestuário">Vestuário</option>
                        <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tipo de Entrega</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button type="button" 
                          onClick={() => setTipoEntrega('digital')}
                          className={`btn-toggle ${tipoEntrega === 'digital' ? 'active' : ''}`}
                          style={{flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: tipoEntrega === 'digital' ? 'var(--primary-light)' : 'white'}}
                        >Digital</button>
                        <button type="button" 
                          onClick={() => setTipoEntrega('fisico')}
                          className={`btn-toggle ${tipoEntrega === 'fisico' ? 'active' : ''}`}
                          style={{flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', background: tipoEntrega === 'fisico' ? 'var(--primary-light)' : 'white'}}
                        >Físico</button>
                    </div>
                  </div>
              </div>

              {tipoEntrega === 'fisico' && (
                  <div className="fade-in" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                      <p style={{ fontWeight: 700, marginTop: 0, marginBottom: '1rem', size: '0.9rem' }}>Logística e Estoque</p>
                      <div className="form-group">
                        <label>Estoque Disponível</label>
                        <input type="number" required value={estoque} onChange={e => setEstoque(parseInt(e.target.value))} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                              <label>Peso (kg)</label>
                              <input type="number" step="0.01" value={dimensoes.peso} onChange={e => setDimensoes({...dimensoes, peso: e.target.value})} />
                          </div>
                          <div className="form-group">
                              <label>Largura (cm)</label>
                              <input type="number" value={dimensoes.largura} onChange={e => setDimensoes({...dimensoes, largura: e.target.value})} />
                          </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="form-group">
                              <label>Altura (cm)</label>
                              <input type="number" value={dimensoes.altura} onChange={e => setDimensoes({...dimensoes, altura: e.target.value})} />
                          </div>
                          <div className="form-group">
                              <label>Comprimento (cm)</label>
                              <input type="number" value={dimensoes.comprimento} onChange={e => setDimensoes({...dimensoes, comprimento: e.target.value})} />
                          </div>
                      </div>
                  </div>
              )}

              {/* IMAGENS SEMPRE OBRIGATÓRIAS */}
              <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>1. Imagens do Produto (Mínimo 1)</p>
              <div className="file-upload-box" style={{margin: '0.5rem 0 1.5rem 0'}}>
                <input type="file" id="images-input" multiple onChange={handleImageChange} style={{ display: 'none' }} accept="image/*"/>
                <label htmlFor="images-input" className="file-label">
                  {imagens.length > 0 ? (
                    <><ImageIcon size={20} color="#10b981" /> {getFileNames(imagens)}</>
                  ) : (
                    <><ImageIcon size={20} /> Selecionar Fotos</>
                  )}
                </label>
              </div>

              {tipoEntrega === 'digital' && (
                  <>
                    <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>2. Arquivos de Conteúdo (Digital)</p>
                    <div className="file-upload-box" style={{marginTop: '0.5rem'}}>
                      <input 
                        type="file" 
                        id="files-input" 
                        multiple
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept=".doc,.docx,.pdf,.zip,.mp3,.mp4,audio/*,video/*"
                      />
                      <label htmlFor="files-input" className="file-label">
                        {arquivos.length > 0 ? (
                          <><Upload size={20} color="#10b981" /> {getFileNames(arquivos)}</>
                        ) : (
                          <><Upload size={20} /> Selecionar arquivos (Docs, PDFs, Zips, Vídeos)</>
                        )}
                      </label>
                    </div>
                  </>
              )}

              <button type="submit" className="btn-primary w-full" disabled={enviando} style={{marginTop: '2rem', height: '50px'}}>
                {enviando ? <Loader2 className="animate-spin mx-auto" /> : "Publicar Produto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
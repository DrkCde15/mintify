import { useEffect, useState } from 'react';
import { Plus, X, Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ titulo: '', preco: '', descricao: '' });
  
  // Estados para os arquivos
  const [arquivoProduto, setArquivoProduto] = useState(null);
  const [imagemCapa, setImagemCapa] = useState(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

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

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setArquivoProduto(file);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemCapa(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivoProduto) return alert("Selecione o arquivo do conteúdo.");
    if (!imagemCapa) return alert("Selecione uma imagem de capa para a vitrine.");

    setEnviando(true);
    
    const formData = new FormData();
    formData.append('arquivo_produto', arquivoProduto);
    formData.append('imagem_capa', imagemCapa);
    formData.append('titulo', form.titulo);
    formData.append('preco', form.preco);
    formData.append('descricao', form.descricao);

    try {
      await api.post('/api/produtos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Produto cadastrado com sucesso!");
      fecharModal();
      fetchProdutos();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Erro ao carregar produto. Verifique se o backend está rodando.");
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setForm({ titulo: '', preco: '', descricao: '' });
    setArquivoProduto(null);
    setImagemCapa(null);
  };

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
                <th>Vendas</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FileText size={20} color="var(--text-muted)" />
                    <strong>{p.titulo}</strong>
                  </td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td>{p.vendas_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="modal-header">
              <h3>Cadastrar Novo Produto</h3>
              <button onClick={fecharModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} className="auth-form">
              <div className="form-group">
                <label>Título do Produto</label>
                <input type="text" required placeholder="Ex: Curso de Python Master" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Preço de Venda (R$)</label>
                <input type="number" step="0.01" required placeholder="0,00" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Descrição Curta</label>
                <textarea rows="2" required placeholder="Explique brevemente o que é o produto" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} 
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </div>

              {/* UPLOAD DE CAPA */}
              <p style={{fontWeight: 600, marginBottom: '0.5rem', marginTop: '1.5rem'}}>1. Imagem de Capa (JPG/PNG)</p>
              <div className="file-upload-box" style={{margin: '0.5rem 0 1.5rem 0'}}>
                <input type="file" id="cover-input" onChange={handleCoverImageChange} style={{ display: 'none' }} accept="image/*"/>
                <label htmlFor="cover-input" className="file-label">
                  {imagemCapa ? <><ImageIcon size={20} color="#10b981" /> {imagemCapa.name}</> : <><ImageIcon size={20} /> Selecionar Imagem da Vitrine</>}
                </label>
              </div>

              {/* UPLOAD DE ARQUIVO MULTIFORMATO */}
              <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>2. Conteúdo do Produto (Todos os formatos)</p>
              <div className="file-upload-box" style={{marginTop: '0.5rem'}}>
                <input 
                  type="file" 
                  id="file-input" 
                  onChange={handleProductFileChange} 
                  style={{ display: 'none' }} 
                  accept=".doc,.docx,.pdf,.zip,.mp3,.mp4,audio/*,video/*"
                />
                <label htmlFor="file-input" className="file-label">
                  {arquivoProduto ? (
                    <><Upload size={20} color="#10b981" /> {arquivoProduto.name}</>
                  ) : (
                    <><Upload size={20} /> Selecionar arquivo (Doc, PDF, Zip, MP3, MP4)</>
                  )}
                </label>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={enviando} style={{marginTop: '1.5rem'}}>
                {enviando ? <Loader2 className="animate-spin" /> : "Criar e Publicar Produto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
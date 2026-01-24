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

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      // Endpoint de produtos agora retorna com mídias
      const response = await api.get('/api/produtos');
      setProdutos(response.data);
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
    // Conteúdo do produto pode ser opcional se for um produto físico sem arquivos digitais
    // if (arquivos.length === 0) return alert("Selecione pelo menos um arquivo de conteúdo para o produto.");

    setEnviando(true);
    
    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('preco', form.preco);
    formData.append('descricao', form.descricao);
    formData.append('tipo_produto', tipoProduto); // Adicionado o tipo de produto

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
      alert("Erro ao cadastrar produto. Verifique o console para mais detalhes.");
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
                <th>Tipo</th> {/* Nova coluna */}
                <th>Vendas</th>
                <th>Mídias</th> {/* Nova coluna */}
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {p.midias && p.midias.length > 0 && p.midias[0].tipo === 'imagem' && p.midias[0].url ? (
                        <img src={`http://localhost:8000/${p.midias[0].url}`} alt={p.titulo} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                    ) : (
                        <FileText size={20} color="var(--text-muted)" />
                    )}
                    <strong>{p.titulo}</strong>
                  </td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td>{p.tipo}</td> {/* Exibir tipo */}
                  <td>{p.vendas_count || 0}</td>
                  <td>{p.midias ? p.midias.length : 0}</td> {/* Exibir count de mídias */}
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
              <div className="form-group">
                <label>Tipo de Produto</label>
                <select value={tipoProduto} onChange={e => setTipoProduto(e.target.value)}>
                    <option value="Curso Online">Curso Online</option>
                    <option value="E-book">E-book</option>
                    <option value="Software">Software</option>
                    <option value="Serviço">Serviço</option>
                    <option value="Outro">Outro</option>
                </select>
              </div>

              {/* UPLOAD DE IMAGENS */}
              <p style={{fontWeight: 600, marginBottom: '0.5rem', marginTop: '1.5rem'}}>1. Imagens da Vitrine (JPG/PNG)</p>
              <div className="file-upload-box" style={{margin: '0.5rem 0 1.5rem 0'}}>
                <input type="file" id="images-input" multiple onChange={handleImageChange} style={{ display: 'none' }} accept="image/*"/>
                <label htmlFor="images-input" className="file-label">
                  {imagens.length > 0 ? (
                    <><ImageIcon size={20} color="#10b981" /> {getFileNames(imagens)}</>
                  ) : (
                    <><ImageIcon size={20} /> Selecionar Imagens (múltiplas)</>
                  )}
                </label>
              </div>

              {/* UPLOAD DE ARQUIVOS (CONTEÚDO DO PRODUTO) */}
              <p style={{fontWeight: 600, marginBottom: '0.5rem'}}>2. Conteúdo do Produto (Opcional, todos os formatos)</p>
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
                    <><Upload size={20} /> Selecionar arquivos (múltiplos: Doc, PDF, Zip, MP3, MP4)</>
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
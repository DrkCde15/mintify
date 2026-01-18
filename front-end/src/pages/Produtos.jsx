import { useEffect, useState } from 'react';
import { Plus, X, Upload, FileText, Video, Loader2 } from 'lucide-react';
import api from '../api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para o Modal e Upload
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ titulo: '', preco: '', descricao: '' });
  const [arquivo, setArquivo] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação de Extensões
    const extensoesPermitidas = /(\.zip|\.doc|\.docx|\.pdf|\.mp4|\.mkv|\.mov)$/i;
    if (!extensoesPermitidas.exec(file.name)) {
      alert("Tipo de arquivo não permitido! Use .zip, .doc, .pdf ou vídeos.");
      e.target.value = ""; // Limpa o input
      return;
    }
    setArquivo(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) return alert("Selecione o arquivo do produto.");

    setEnviando(true);
    
    // FormData é necessário para enviar arquivos via API
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('titulo', form.titulo);
    formData.append('preco', form.preco);
    formData.append('descricao', form.descricao);

    try {
      await api.post('/api/produtos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Produto cadastrado com sucesso!");
      setModalAberto(false);
      setForm({ titulo: '', preco: '', descricao: '' });
      setArquivo(null);
      fetchProdutos(); // Atualiza a lista
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Erro ao carregar produto. Verifique os dados.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Meus Produtos</h1>
        <button className="btn-primary" onClick={() => setModalAberto(true)}>
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {carregando ? <p>Carregando...</p> : (
        <div className="table-container fade-in">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Descrição</th>
                <th>Vendas</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.titulo}</strong></td>
                  <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                  <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{p.descricao}</td>
                  <td>{p.vendas_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE UPLOAD */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3>Cadastrar Novo Produto</h3>
              <button onClick={() => setModalAberto(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpload} className="auth-form">
              <div className="form-group">
                <label>Título do Produto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Curso de Python do Zero"
                  required 
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  required 
                  value={form.preco}
                  onChange={e => setForm({ ...form, preco: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Breve Descrição</label>
                <textarea 
                  placeholder="O que o aluno vai aprender?"
                  rows="3"
                  required
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>

              <div className="file-upload-box">
                <input 
                  type="file" 
                  id="file-input" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                  accept=".zip,.doc,.docx,.pdf,video/*"
                />
                <label htmlFor="file-input" className="file-label">
                  {arquivo ? (
                    <><Upload size={20} color="#10b981" /> {arquivo.name}</>
                  ) : (
                    <><Upload size={20} /> Selecionar Arquivo (.zip, .pdf, Vídeos)</>
                  )}
                </label>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={enviando}>
                {enviando ? <Loader2 className="animate-spin" /> : "Criar Produto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
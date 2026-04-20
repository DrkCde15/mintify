import axios, { type AxiosInstance, type AxiosError } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Cliente axios configurado
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("usuario")
        localStorage.removeItem("perfil")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

// Tipos de dados
export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: "aluno" | "vendedor" | null
  data_criacao?: string
}

export interface Midia {
  id: number
  url: string
  tipo: "imagem" | "video" | "arquivo"
}

export interface Produto {
  id: number
  titulo: string
  descricao: string
  preco: number
  tipo: string
  tipo_entrega: "digital" | "fisico"
  estoque?: number
  midias: Midia[]
  vendedor_email?: string
  vendas_count?: number
  peso_kg?: number
  largura_cm?: number
  altura_cm?: number
  comprimento_cm?: number
}

export interface Compra {
  id: number
  produto: Produto
  data_compra: string
  valor_pago: number
  tipo_entrega_momento: "digital" | "fisico"
  status_logistica?: string
  codigo_rastreio?: string
  aluno_email?: string
  // Endereço
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface Avaliacao {
  id: number
  nota: number
  comentario?: string
  data_avaliacao: string
  aluno: {
    id: number
    nome: string
  }
}

export interface Aula {
  id: number
  titulo: string
  tipo: "video" | "arquivo"
  url: string
  concluida: boolean
}

export interface Notificacao {
  id: number
  titulo: string
  mensagem: string
  lida: number
  data_criacao: string
}

export interface DashboardStats {
  saldo_total: number
  vendas_hoje: number
  novos_alunos: number
}

export interface FinanceiroResumo {
  saldo_total: number
  saldo_disponivel: number
  historico: Array<{
    data: string
    tipo: "venda" | "saque"
    valor: number
    status: "concluido" | "pendente"
  }>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Helpers para montar URLs
export function getMediaUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${API_BASE_URL}/${path}`
}

export default api

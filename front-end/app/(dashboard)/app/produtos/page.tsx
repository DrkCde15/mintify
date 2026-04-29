"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Plus, X, Upload, ImageIcon, Loader2, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "sonner"
import api, { type Produto, getMediaUrl } from "@/lib/api"

const CATEGORIAS = [
  "Suplemento",
  "Curso Online",
  "E-book",
  "Equipamento",
  "Vestuário",
  "Outro",
]

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Form states
  const [form, setForm] = useState({
    titulo: "",
    preco: "",
    descricao: "",
  })
  const [tipoProduto, setTipoProduto] = useState("Curso Online")
  const [tipoEntrega, setTipoEntrega] = useState<"digital" | "fisico">("digital")
  const [estoque, setEstoque] = useState(0)
  const [dimensoes, setDimensoes] = useState({ peso: "", largura: "", altura: "", comprimento: "" })
  const [imagens, setImagens] = useState<File[]>([])
  const [arquivos, setArquivos] = useState<File[]>([])

  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await api.get("/api/produtos")
      const data = response.data.items || response.data
      setProdutos(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast.error("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagens(Array.from(e.target.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (imagens.length === 0) {
      toast.error("Selecione pelo menos uma imagem")
      return
    }

    if (tipoEntrega === "digital" && arquivos.length === 0) {
      toast.error("Produtos digitais precisam de pelo menos um arquivo")
      return
    }

    setEnviando(true)

    const formData = new FormData()
    formData.append("titulo", form.titulo)
    formData.append("preco", form.preco)
    formData.append("descricao", form.descricao)
    formData.append("tipo_produto", tipoProduto)
    formData.append("tipo_entrega", tipoEntrega)

    if (tipoEntrega === "fisico") {
      formData.append("estoque", String(estoque))
      if (dimensoes.peso) formData.append("peso_kg", dimensoes.peso)
      if (dimensoes.largura) formData.append("largura_cm", dimensoes.largura)
      if (dimensoes.altura) formData.append("altura_cm", dimensoes.altura)
      if (dimensoes.comprimento) formData.append("comprimento_cm", dimensoes.comprimento)
    }

    imagens.forEach((file) => formData.append("imagens", file))
    arquivos.forEach((file) => formData.append("arquivos", file))

    try {
      const response = await api.post("/api/produtos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Produto cadastrado com sucesso!")
      resetForm()
      setModalOpen(false)
      fetchProdutos()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro ao cadastrar produto")
    } finally {
      setEnviando(false)
    }
  }

  const resetForm = () => {
    setForm({
      titulo: "",
      preco: "",
      descricao: "",
    })
    setTipoProduto("Curso Online")
    setTipoEntrega("digital")
    setEstoque(0)
    setDimensoes({ peso: "", largura: "", altura: "", comprimento: "" })
    setImagens([])
    setArquivos([])
  }

  const getFileNames = (files: File[]) => {
    if (files.length === 0) return ""
    if (files.length === 1) return files[0].name
    return `${files.length} arquivos selecionados`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos à venda
            </p>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto para publicá-lo na vitrine
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título do Produto</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Curso de Marketing Digital"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva seu produto..."
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={tipoProduto} onValueChange={setTipoProduto}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Entrega</Label>
                  <ToggleGroup
                    type="single"
                    value={tipoEntrega}
                    onValueChange={(val) => val && setTipoEntrega(val as "digital" | "fisico")}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="digital" className="flex-1">
                      Digital
                    </ToggleGroupItem>
                    <ToggleGroupItem value="fisico" className="flex-1">
                      Físico
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              {tipoEntrega === "fisico" && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Logística e Estoque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque Disponível</Label>
                      <Input
                        id="estoque"
                        type="number"
                        min="0"
                        value={estoque}
                        onChange={(e) => setEstoque(parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso">Peso (kg)</Label>
                        <Input
                          id="peso"
                          type="number"
                          step="0.01"
                          value={dimensoes.peso}
                          onChange={(e) => setDimensoes({ ...dimensoes, peso: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="largura">Largura (cm)</Label>
                        <Input
                          id="largura"
                          type="number"
                          value={dimensoes.largura}
                          onChange={(e) => setDimensoes({ ...dimensoes, largura: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="altura">Altura (cm)</Label>
                        <Input
                          id="altura"
                          type="number"
                          value={dimensoes.altura}
                          onChange={(e) => setDimensoes({ ...dimensoes, altura: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comprimento">Comprimento (cm)</Label>
                        <Input
                          id="comprimento"
                          type="number"
                          value={dimensoes.comprimento}
                          onChange={(e) => setDimensoes({ ...dimensoes, comprimento: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagens do Produto (Mínimo 1)</Label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                      <ImageIcon className={imagens.length > 0 ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
                      <span className={imagens.length > 0 ? "text-primary" : "text-muted-foreground"}>
                        {imagens.length > 0 ? getFileNames(imagens) : "Selecionar Fotos"}
                      </span>
                    </div>
                  </div>
                </div>

                {tipoEntrega === "digital" && (
                  <div className="space-y-2">
                    <Label>Arquivos de Conteúdo</Label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept=".doc,.docx,.pdf,.zip,.mp3,.mp4,audio/*,video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                        <Upload className={arquivos.length > 0 ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground"} />
                        <span className={arquivos.length > 0 ? "text-primary" : "text-muted-foreground"}>
                          {arquivos.length > 0 ? getFileNames(arquivos) : "Selecionar Arquivos (PDF, Vídeos, etc)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-12" disabled={enviando}>
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  "Publicar Produto"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Vendas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.length > 0 ? (
                  produtos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.midias && p.midias.length > 0 && (
                            <div className="relative h-10 w-10 overflow-hidden rounded">
                              <Image
                                src={getMediaUrl(p.midias[0].url)}
                                alt={p.titulo}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium">{p.titulo}</span>
                        </div>
                      </TableCell>
                      <TableCell>R$ {parseFloat(String(p.preco)).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {p.tipo_entrega}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.tipo_entrega === "fisico" ? p.estoque : "∞"}
                      </TableCell>
                      <TableCell>{p.vendas_count || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Nenhum produto cadastrado. Clique em &quot;Novo Produto&quot; para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

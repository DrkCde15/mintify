"use client"

import { useEffect, useState, use } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Star, User, Package, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { toast } from "sonner"
import api, { type Produto, type Avaliacao, type PaginatedResponse, getMediaUrl } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProdutoDetalhePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, usuario } = useAuthStore()

  const [product, setProduct] = useState<Produto | null>(null)
  const [reviews, setReviews] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState("")
  const [userBoughtProduct, setUserBoughtProduct] = useState(false)
  const [newReview, setNewReview] = useState({ nota: 0, comentario: "" })
  const [reviewPage, setReviewPage] = useState(1)
  const [totalReviewPages, setTotalReviewPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  })

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      router.push("/")
      return
    }
    fetchProductAndData()
  }, [id])

  const fetchProductAndData = async () => {
    setLoading(true)
    try {
      const productRes = await api.get<Produto>(`/api/produtos/${id}`)
      setProduct(productRes.data)

      if (productRes.data.midias && productRes.data.midias.length > 0) {
        setCurrentImage(getMediaUrl(productRes.data.midias[0].url))
      }

      await fetchReviews(1)

      if (isAuthenticated && usuario?.perfil === "aluno") {
        const meusCursosRes = await api.get("/api/meus-cursos")
        const data = meusCursosRes.data.items || meusCursosRes.data
        const bought = (data || []).some((course: any) => course.produto?.id === parseInt(id))
        setUserBoughtProduct(bought)
      }
    } catch (err) {
      toast.error("Erro ao carregar produto")
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async (p = 1) => {
    try {
      const reviewsRes = await api.get<PaginatedResponse<Avaliacao>>(`/api/produtos/${id}/avaliacoes?page=${p}&per_page=5`)
      setReviews(reviewsRes.data.items || [])
      setTotalReviewPages(reviewsRes.data.total_pages || 1)
      setReviewPage(reviewsRes.data.page || 1)
      setTotalReviews(reviewsRes.data.total || 0)
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newReview.nota === 0) {
      toast.error("Por favor, dê uma nota de 1 a 5")
      return
    }
    try {
      await api.post("/api/avaliacoes", {
        produto_id: parseInt(id),
        nota: newReview.nota,
        comentario: newReview.comentario,
      })
      toast.success("Avaliação enviada com sucesso!")
      setNewReview({ nota: 0, comentario: "" })
      await fetchReviews(1)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao enviar avaliação")
    }
  }

  const handleBuyProduct = async () => {
    if (product?.tipo_entrega === "fisico") {
      const requiredFields = ["cep", "logradouro", "numero", "bairro", "cidade", "estado"]
      const emptyFields = requiredFields.filter((key) => !endereco[key as keyof typeof endereco])
      if (emptyFields.length > 0) {
        toast.error("Preencha todos os campos de endereço obrigatórios")
        return
      }
    }

    try {
      const body = product?.tipo_entrega === "fisico" ? { endereco } : { endereco: null }
      await api.post(`/api/produtos/comprar/${id}`, body)
      toast.success("Compra realizada com sucesso!")
      router.push("/app/meus-cursos")
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao comprar o produto")
    }
  }

  const renderStars = (nota: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))
  }

  const isVendedor = usuario?.perfil === "vendedor"
  const isSeller = isAuthenticated && isVendedor && product?.vendedor_email === usuario?.email

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-10 w-1/3 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Produto não encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Imagens */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-xl overflow-hidden border bg-muted">
              {currentImage && (
                <Image src={currentImage} alt={product.titulo} fill className="object-contain" />
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.midias.map((media, index) => {
                const url = getMediaUrl(media.url)
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(url)}
                    className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === url ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image src={url} alt={`${product.titulo} ${index + 1}`} fill className="object-cover" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.titulo}</h1>
              <p className="text-4xl font-bold text-primary mt-4">
                R$ {product.preco.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {product.vendedor_email}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {product.tipo} ({product.tipo_entrega})
              </span>
              {product.tipo_entrega === "fisico" && (
                <Badge variant={product.estoque && product.estoque > 0 ? "secondary" : "destructive"}>
                  {product.estoque && product.estoque > 0 ? `${product.estoque} em estoque` : "Esgotado"}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground">{product.descricao}</p>

            {/* Botões de ação */}
            {isAuthenticated && usuario?.perfil === "aluno" && !userBoughtProduct && !isSeller && (
              <>
                {product.tipo_entrega === "fisico" && product.estoque && product.estoque > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="CEP" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} />
                        <Input placeholder="Cidade" className="col-span-2" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <Input placeholder="Rua" className="col-span-3" value={endereco.logradouro} onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })} />
                        <Input placeholder="Nº" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
                        <Input placeholder="UF" value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })} />
                        <Input placeholder="Compl." value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(product.tipo_entrega !== "fisico" || (product.estoque && product.estoque > 0)) && (
                  <Button onClick={handleBuyProduct} size="lg" className="w-full">
                    {product.tipo_entrega === "fisico" ? "Confirmar Endereço e Comprar" : "Comprar Agora"}
                  </Button>
                )}
              </>
            )}

            {!isAuthenticated && (
              <Card className="bg-muted/50">
                <CardContent className="py-4 text-center text-muted-foreground">
                  Faça login como aluno para comprar este produto.
                </CardContent>
              </Card>
            )}

            {isAuthenticated && userBoughtProduct && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4 text-center text-primary">
                  {product.tipo_entrega === "fisico"
                    ? "Você já comprou este produto. Acompanhe a entrega no seu perfil."
                    : "Você já possui este conteúdo."}
                </CardContent>
              </Card>
            )}

            {isSeller && (
              <Card className="bg-muted/50">
                <CardContent className="py-4 text-center text-muted-foreground">
                  Você é o vendedor deste produto.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Avaliações */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Avaliações dos Clientes ({totalReviews})</h2>

          {reviews.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{review.aluno.nome}</span>
                      <div className="flex">{renderStars(review.nota)}</div>
                    </div>
                    <p className="text-muted-foreground">{review.comentario || "Sem comentário."}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.data_avaliacao).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {totalReviewPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button variant="outline" size="sm" onClick={() => fetchReviews(reviewPage - 1)} disabled={reviewPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {reviewPage} de {totalReviewPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => fetchReviews(reviewPage + 1)} disabled={reviewPage === totalReviewPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Form de avaliação */}
          {isAuthenticated && usuario?.perfil === "aluno" && userBoughtProduct && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Deixe sua avaliação</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nota</Label>
                    <Select value={String(newReview.nota)} onValueChange={(v) => setNewReview({ ...newReview, nota: parseInt(v) })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Selecione</SelectItem>
                        <SelectItem value="1">1 Estrela</SelectItem>
                        <SelectItem value="2">2 Estrelas</SelectItem>
                        <SelectItem value="3">3 Estrelas</SelectItem>
                        <SelectItem value="4">4 Estrelas</SelectItem>
                        <SelectItem value="5">5 Estrelas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Comentário (opcional)</Label>
                    <Textarea
                      placeholder="Escreva seu comentário..."
                      value={newReview.comentario}
                      onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Enviar Avaliação</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

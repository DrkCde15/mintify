"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, DollarSign, Tag, ChevronLeft, ChevronRight, ImageIcon, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import api, { type Produto, type PaginatedResponse, getMediaUrl } from "@/lib/api"

export default function HomePage() {
  const [products, setProducts] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [productType, setProductType] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", String(page))
      params.append("per_page", "12")

      if (searchTerm) params.append("q", searchTerm)
      if (minPrice) params.append("min_preco", minPrice)
      if (maxPrice) params.append("max_preco", maxPrice)
      if (productType) params.append("tipo", productType)

      const response = await api.get<PaginatedResponse<Produto>>(`/api/produtos/buscar?${params.toString()}`)
      setProducts(response.data.items || [])
      setTotalPages(response.data.total_pages || 1)
      setTotalItems(response.data.total || 0)
      setCurrentPage(response.data.page || 1)
    } catch (err) {
      setError("Falha ao carregar produtos.")
      console.error("Erro ao buscar produtos:", err)
    } finally {
      setLoading(false)
    }
  }

  // Efeito para busca automática com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1)
    }, 500) // Aguarda 500ms após o usuário parar de digitar

    return () => clearTimeout(timer)
  }, [searchTerm, minPrice, maxPrice, productType])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              A plataforma que transforma conhecimento em negócio
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Venda e compre{" "}
              <span className="text-primary">produtos digitais</span>{" "}
              com facilidade
            </h1>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Cursos online, e-books, templates e muito mais. Comece a vender hoje ou encontre o conteúdo perfeito para você.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/cadastro">
                  Começar a Vender
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#produtos">
                  Explorar Produtos
                </Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pagamentos Instantâneos</h3>
                <p className="text-sm text-muted-foreground">Receba suas vendas diretamente via PIX</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">100% Seguro</h3>
                <p className="text-sm text-muted-foreground">Seus dados e transações protegidos</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Área de Membros</h3>
                <p className="text-sm text-muted-foreground">Entregue conteúdo de forma profissional</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main id="produtos" className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Explore nossos produtos</h2>
          <p className="text-muted-foreground">
            Encontre cursos, e-books e materiais exclusivos
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-32">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-32">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-40">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tipo"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button onClick={() => fetchProducts(1)}>Filtrar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {totalItems} {totalItems === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum produto encontrado.</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/produto/${product.id}`}>
                    <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:scale-[1.02] group">
                      <div className="aspect-square relative bg-muted overflow-hidden">
                        {product.midias && product.midias.length > 0 ? (
                          <Image
                            src={getMediaUrl(product.midias[0].url)}
                            alt={product.titulo}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-primary">
                          {product.tipo_entrega === "digital" ? "Digital" : "Físico"}
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-2">{product.titulo}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.descricao}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-lg font-bold text-primary">
                            R$ {product.preco?.toFixed(2) || "0,00"}
                          </p>
                          <Badge variant="outline">{product.tipo}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Mintify. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  User,
  PlayCircle,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import api, { type Compra, type PaginatedResponse, getMediaUrl } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export default function MeusCursosPage() {
  const { usuario } = useAuthStore()
  const [meusProdutos, setMeusProdutos] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const carregarMeusCursos = async (p = 1) => {
    setLoading(true)
    try {
      const res = await api.get<PaginatedResponse<Compra>>(`/api/meus-cursos?page=${p}&per_page=6`)
      setMeusProdutos(res.data.items || [])
      setTotalPages(res.data.total_pages || 1)
      setPage(res.data.page || 1)
    } catch (err) {
      console.error("Erro ao carregar cursos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMeusCursos(1)
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      carregarMeusCursos(newPage)
      window.scrollTo(0, 0)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const getIcon = (url?: string) => {
    if (!url) return <BookOpen className="h-5 w-5" />
    if (url.includes(".mp4") || url.includes(".mkv")) return <PlayCircle className="h-5 w-5" />
    return <Download className="h-5 w-5" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabeçalho de Perfil */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="flex items-center gap-6 py-6">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(usuario?.nome || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Olá, {usuario?.nome}!</h2>
            <p className="text-muted-foreground">
              {usuario?.email} • <Badge variant="secondary" className="bg-primary/10 text-primary">Aluno Premium</Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Título da seção */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minha Biblioteca de Conteúdos</h1>
          <p className="text-muted-foreground">
            Acesse seus cursos e materiais adquiridos
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 w-16 bg-muted rounded animate-pulse mb-4" />
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-pulse mb-4" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : meusProdutos.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meusProdutos.map((compra) => {
              const p = compra.produto
              const arquivoUrl = p.midias?.find(
                (m) => m.tipo === "arquivo" || m.tipo === "video"
              )?.url

              return (
                <Card key={compra.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant="secondary"
                        className={
                          compra.tipo_entrega_momento === "fisico"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-primary/10 text-primary"
                        }
                      >
                        {compra.tipo_entrega_momento === "fisico" ? "FÍSICO" : "DIGITAL"}
                      </Badge>
                      {getIcon(arquivoUrl)}
                    </div>
                    <CardTitle className="text-lg mt-3">{p.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {compra.tipo_entrega_momento === "fisico" ? (
                      <div className="flex-1 space-y-3">
                        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                          <p className="text-sm font-medium">Status da Entrega:</p>
                          <Badge variant="outline" className="capitalize">
                            {compra.status_logistica?.replace("_", " ") || "Processando"}
                          </Badge>
                          {compra.codigo_rastreio && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Código:</strong> {compra.codigo_rastreio}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground text-center mt-auto">
                          O vendedor atualizará o código de rastreio em breve.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                          {p.descricao || "Sem descrição disponível."}
                        </p>
                        <Button asChild className="w-full mt-4 gap-2">
                          <Link href={`/app/curso/${p.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            Entrar na Área de Membros
                          </Link>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Você ainda não possui produtos</h3>
              <p className="text-muted-foreground">
                Explore o nosso mercado e comece a aprender agora mesmo!
              </p>
            </div>
            <Button asChild>
              <Link href="/">Ir para a Vitrine</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

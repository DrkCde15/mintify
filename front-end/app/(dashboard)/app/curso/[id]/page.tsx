"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PlayCircle,
  FileText,
  CheckCircle,
  Circle,
  ChevronLeft,
  Download,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import api, { type Produto, type Aula, getMediaUrl } from "@/lib/api"

interface CursoPageProps {
  params: Promise<{ id: string }>
}

export default function CursoPage({ params }: CursoPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [curso, setCurso] = useState<Produto | null>(null)
  const [aulas, setAulas] = useState<Aula[]>([])
  const [aulaAtual, setAulaAtual] = useState<Aula | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetchMateriais()
  }, [id])

  const fetchMateriais = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/membros/curso/${id}`)
      setCurso(response.data.produto)
      setAulas(response.data.aulas)

      if (response.data.aulas.length > 0) {
        setAulaAtual(response.data.aulas[0])
      }
    } catch (err: any) {
      console.error("Erro ao carregar materiais:", err)
      setErro(err.response?.data?.detail || "Erro ao carregar o curso.")
    } finally {
      setLoading(false)
    }
  }

  const marcarConcluida = async (aulaId: number) => {
    try {
      await api.post(`/api/membros/concluir-aula/${aulaId}`)
      setAulas(aulas.map((aula) => (aula.id === aulaId ? { ...aula, concluida: true } : aula)))
      if (aulaAtual?.id === aulaId) {
        setAulaAtual({ ...aulaAtual, concluida: true })
      }
    } catch (err) {
      console.error("Erro ao concluir aula:", err)
    }
  }

  const progresso = aulas.length > 0
    ? Math.round((aulas.filter((a) => a.concluida).length / aulas.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (erro) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Acesso Negado</h2>
        <p className="text-muted-foreground">{erro}</p>
        <Button asChild>
          <Link href="/app/meus-cursos">Voltar para meus cursos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col -m-6 md:-m-8">
      {/* Header */}
      <header className="flex items-center gap-4 border-b bg-card px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/app/meus-cursos")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{curso?.titulo}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Progress value={progresso} className="h-2 w-40" />
            <span className="text-sm text-muted-foreground">{progresso}% concluído</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-6">
          {aulaAtual ? (
            <>
              {/* Player / Preview */}
              <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                {aulaAtual.tipo === "video" ? (
                  <video
                    key={aulaAtual.id}
                    controls
                    className="w-full h-full"
                    poster=""
                  >
                    <source src={getMediaUrl(aulaAtual.url)} type="video/mp4" />
                    Seu navegador não suporta vídeos.
                  </video>
                ) : (
                  <Card className="h-full flex flex-col items-center justify-center gap-4 bg-muted/50">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">{aulaAtual.titulo}</h3>
                    <p className="text-muted-foreground">Este é um material de apoio (PDF/Arquivo)</p>
                    <Button asChild>
                      <a
                        href={getMediaUrl(aulaAtual.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Arquivo
                      </a>
                    </Button>
                  </Card>
                )}
              </div>

              {/* Detalhes da Aula */}
              <Card className="mt-6">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">{aulaAtual.titulo}</h2>
                    <Button
                      onClick={() => marcarConcluida(aulaAtual.id)}
                      disabled={aulaAtual.concluida}
                      variant={aulaAtual.concluida ? "secondary" : "default"}
                      className="gap-2"
                    >
                      {aulaAtual.concluida ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Concluída
                        </>
                      ) : (
                        "Marcar como concluída"
                      )}
                    </Button>
                  </div>
                  <p className="mt-4 text-muted-foreground">{curso?.descricao}</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <PlayCircle className="h-16 w-16" />
              <p>Selecione uma aula para começar.</p>
            </div>
          )}
        </div>

        {/* Sidebar de Aulas */}
        <aside className="w-80 border-l bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Conteúdo do Curso</h3>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="divide-y">
              {aulas.map((aula, index) => (
                <button
                  key={aula.id}
                  onClick={() => setAulaAtual(aula)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                    aulaAtual?.id === aula.id && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="mt-0.5">
                    {aula.concluida ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Aula {index + 1}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        aulaAtual?.id === aula.id && "text-primary"
                      )}
                    >
                      {aula.titulo}
                    </p>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {aula.tipo === "video" ? (
                      <PlayCircle className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, LayoutDashboard, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/lib/store"

type PerfilTipo = "aluno" | "vendedor"

interface PerfilOption {
  tipo: PerfilTipo
  icon: React.ReactNode
  title: string
  description: string
}

const opcoes: PerfilOption[] = [
  {
    tipo: "aluno",
    icon: <ShoppingCart className="h-8 w-8" />,
    title: "Quero Comprar",
    description: "Acessar o marketplace, comprar cursos e materiais exclusivos.",
  },
  {
    tipo: "vendedor",
    icon: <LayoutDashboard className="h-8 w-8" />,
    title: "Quero Vender",
    description: "Cadastrar produtos digitais, gerenciar alunos e receber pagamentos.",
  },
]

export default function EscolhaPerfilPage() {
  const router = useRouter()
  const { updatePerfil } = useAuthStore()
  const [tipo, setTipo] = useState<PerfilTipo | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFinalizar = async () => {
    if (!tipo) {
      toast.error("Por favor, selecione uma das opções")
      return
    }

    setLoading(true)
    try {
      await api.put("/api/usuarios/completar-perfil", { perfil: tipo })
      updatePerfil(tipo)
      toast.success("Perfil configurado com sucesso!")

      if (tipo === "aluno") {
        router.push("/")
      } else {
        router.push("/app")
      }
    } catch (error) {
      toast.error("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-2xl animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Como você deseja usar o Mintify?</CardTitle>
            <CardDescription>
              Personalize sua experiência de acordo com seu objetivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {opcoes.map((opcao) => (
                <button
                  key={opcao.tipo}
                  onClick={() => setTipo(opcao.tipo)}
                  className={cn(
                    "relative rounded-xl border-2 p-6 text-left transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    tipo === opcao.tipo
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border"
                  )}
                >
                  {tipo === opcao.tipo && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                  <div
                    className={cn(
                      "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors",
                      tipo === opcao.tipo
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {opcao.icon}
                  </div>
                  <h3 className="text-center text-lg font-semibold">{opcao.title}</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {opcao.description}
                  </p>
                </button>
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!tipo || loading}
              onClick={handleFinalizar}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Começar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

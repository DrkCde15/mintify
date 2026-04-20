"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Users, DollarSign, ArrowUpRight, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api, { type DashboardStats } from "@/lib/api"
import { useAuthStore, useIsVendedor } from "@/lib/store"

export default function DashboardPage() {
  const router = useRouter()
  const isVendedor = useIsVendedor()
  const { usuario } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    saldo_total: 0,
    vendas_hoje: 0,
    novos_alunos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se não for vendedor, redireciona para meus cursos
    if (usuario && !isVendedor) {
      router.push("/app/meus-cursos")
      return
    }

    const loadStats = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/dashboard")
        setStats(response.data)
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err)
        setError("Não foi possível carregar as estatísticas.")
      } finally {
        setLoading(false)
      }
    }

    if (isVendedor) {
      loadStats()
    }
  }, [isVendedor, usuario, router])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Veja como estão seus resultados hoje.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Total
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R$ {stats.saldo_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm text-primary">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.5% este mês</span>
            </div>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas Hoje
            </CardTitle>
            <div className="rounded-lg bg-chart-2/10 p-2 text-chart-2">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.vendas_hoje}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Última venda há 14 minutos
            </p>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-chart-2/5" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Alunos
            </CardTitle>
            <div className="rounded-lg bg-chart-3/10 p-2 text-chart-3">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.novos_alunos}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Total de 1.240 alunos ativos
            </p>
          </CardContent>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-chart-3/5" />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
          <CardDescription>
            Últimas movimentações da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Nenhuma atividade suspeita detectada nas últimas 24h
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { DollarSign, Wallet, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import api, { type FinanceiroResumo } from "@/lib/api"

export default function FinanceiroPage() {
  const [dados, setDados] = useState<FinanceiroResumo>({
    saldo_total: 0,
    saldo_disponivel: 0,
    historico: [],
  })
  const [valorSaque, setValorSaque] = useState("")
  const [chavePix, setChavePix] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/financeiro/resumo")
      setDados(res.data)
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err)
      toast.error("Erro ao carregar dados financeiros")
    } finally {
      setLoading(false)
    }
  }

  const handleSaque = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const valor = parseFloat(valorSaque)
    if (isNaN(valor) || valor <= 0) {
      toast.error("Informe um valor válido")
      return
    }
    
    if (valor > dados.saldo_disponivel) {
      toast.error("Saldo insuficiente para este saque")
      return
    }

    if (!chavePix.trim()) {
      toast.error("Informe sua chave PIX")
      return
    }

    setEnviando(true)
    try {
      await api.post("/api/financeiro/saque", {
        valor: valorSaque,
        chave_pix: chavePix,
      })
      toast.success("Solicitação de saque enviada com sucesso!")
      setValorSaque("")
      setChavePix("")
      carregarDados()
    } catch (err) {
      toast.error("Erro ao solicitar saque")
    } finally {
      setEnviando(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <DollarSign className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie seus ganhos e solicite saques
          </p>
        </div>
      </div>

      {/* Cards de Saldo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Total (Vendas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R$ {dados.saldo_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponível para Saque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              R$ {dados.saldo_disponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Formulário de Saque */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Solicitar Saque
            </CardTitle>
            <CardDescription>
              Transfira seu saldo para sua conta bancária via PIX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaque} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor do Saque (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={valorSaque}
                  onChange={(e) => setValorSaque(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix">Chave PIX</Label>
                <Input
                  id="pix"
                  type="text"
                  placeholder="CPF, E-mail ou Chave Aleatória"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={enviando || !valorSaque}
              >
                {enviando ? "Processando..." : "Solicitar Transferência"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>
              Histórico de vendas e saques realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.historico.length > 0 ? (
                  dados.historico.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(h.data)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {h.tipo === "venda" ? "Venda" : "Saque"}
                      </TableCell>
                      <TableCell
                        className={h.tipo === "venda" ? "text-primary" : "text-destructive"}
                      >
                        {h.tipo === "venda" ? "+" : "-"} R$ {h.valor.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {h.status === "concluido" ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Concluído
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-chart-3/10 text-chart-3">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

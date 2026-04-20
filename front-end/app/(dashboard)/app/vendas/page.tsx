"use client"

import { useEffect, useState } from "react"
import { Truck, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner"
import api, { type Compra, type PaginatedResponse } from "@/lib/api"

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pendente_envio: { label: "Pendente", variant: "secondary" },
  enviado: { label: "Enviado", variant: "default" },
  entregue: { label: "Entregue", variant: "default" },
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<Compra | null>(null)
  const [novoStatus, setNovoStatus] = useState("")
  const [novoRastreio, setNovoRastreio] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetchVendas(1)
  }, [])

  const fetchVendas = async (p = 1) => {
    setLoading(true)
    try {
      const response = await api.get<PaginatedResponse<Compra>>(`/api/vendedor/vendas?page=${p}&per_page=10`)
      setVendas(response.data.items || [])
      setTotalPages(response.data.total_pages || 1)
      setPage(response.data.page || 1)
      setTotalItems(response.data.total || 0)
    } catch (error) {
      console.error("Erro ao carregar vendas:", error)
      toast.error("Erro ao carregar vendas")
    } finally {
      setLoading(false)
    }
  }

  const abrirLogistica = (venda: Compra) => {
    setVendaSelecionada(venda)
    setNovoStatus(venda.status_logistica || "pendente_envio")
    setNovoRastreio(venda.codigo_rastreio || "")
    setModalOpen(true)
  }

  const handleUpdateLogistica = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendaSelecionada) return

    setSalvando(true)
    try {
      const formData = new FormData()
      formData.append("status_logistica", novoStatus)
      formData.append("codigo_rastreio", novoRastreio)

      await api.patch(`/api/vendedor/vendas/${vendaSelecionada.id}`, formData)
      toast.success("Logística atualizada com sucesso!")
      setModalOpen(false)
      fetchVendas(page)
    } catch (error) {
      toast.error("Erro ao atualizar logística")
    } finally {
      setSalvando(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status?: string) => {
    const statusInfo = STATUS_MAP[status || ""] || { label: "Processando", variant: "secondary" as const }
    return (
      <Badge variant={statusInfo.variant} className="gap-1">
        <span className="h-2 w-2 rounded-full bg-current" />
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Vendas</h1>
          <p className="text-muted-foreground">
            Você realizou <strong>{totalItems}</strong> vendas no total
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.length > 0 ? (
                    vendas.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(v.data_compra)}
                        </TableCell>
                        <TableCell className="font-medium">{v.produto.titulo}</TableCell>
                        <TableCell className="text-muted-foreground">{v.aluno_email}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {v.valor_pago.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              v.tipo_entrega_momento === "fisico"
                                ? "border-chart-2 text-chart-2"
                                : "border-primary text-primary"
                            }
                          >
                            {v.tipo_entrega_momento?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {v.tipo_entrega_momento === "fisico" ? (
                            getStatusBadge(v.status_logistica)
                          ) : (
                            <span className="text-muted-foreground text-sm">Liberado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {v.tipo_entrega_momento === "fisico" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirLogistica(v)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Logística
                            </Button>
                          ) : (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Nenhuma venda encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchVendas(page - 1)}
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
                    onClick={() => fetchVendas(page + 1)}
                    disabled={page === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Logística */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Gerenciar Logística
            </DialogTitle>
            <DialogDescription>
              Atualize o status de entrega e código de rastreio
            </DialogDescription>
          </DialogHeader>

          {vendaSelecionada && (
            <>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p>
                    <strong>Produto:</strong> {vendaSelecionada.produto.titulo}
                  </p>
                  <p>
                    <strong>Endereço:</strong>
                  </p>
                  <p className="text-muted-foreground">
                    {vendaSelecionada.logradouro}, {vendaSelecionada.numero}
                    {vendaSelecionada.complemento && ` (${vendaSelecionada.complemento})`}
                    <br />
                    {vendaSelecionada.bairro} - {vendaSelecionada.cidade}/{vendaSelecionada.estado}
                    <br />
                    CEP: {vendaSelecionada.cep}
                  </p>
                </CardContent>
              </Card>

              <form onSubmit={handleUpdateLogistica} className="space-y-4">
                <div className="space-y-2">
                  <Label>Status da Entrega</Label>
                  <Select value={novoStatus} onValueChange={setNovoStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente_envio">Aguardando Envio</SelectItem>
                      <SelectItem value="enviado">Enviado / Em Trânsito</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rastreio">Código de Rastreio</Label>
                  <Input
                    id="rastreio"
                    placeholder="Ex: BR123456789"
                    value={novoRastreio}
                    onChange={(e) => setNovoRastreio(e.target.value)}
                  />
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : "Atualizar Pedido"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ShoppingCart, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
type PerfilTipo = "aluno" | "vendedor"
type TipoProdutoVendedor = "digital" | "fisico"

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "aluno" as PerfilTipo,
    chave_pix: "",
    tipo_produto_interesse: "digital" as TipoProdutoVendedor,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: Record<string, string> = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.perfil,
      }

      if (formData.perfil === "vendedor") {
        payload.chave_pix = formData.chave_pix.trim()
        payload.tipo_produto_interesse = formData.tipo_produto_interesse
      }

      const response = await fetch(`${API_BASE_URL}/api/usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Conta criada com sucesso!")
        router.push("/login")
      } else {
        toast.error(data.detail || "Erro ao cadastrar")
      }
    } catch (error) {
      toast.error("Servidor offline. Verifique o backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary">
            Mintify
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crie sua conta</CardTitle>
            <CardDescription>
              Comece a vender ou comprar produtos digitais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Como voce quer usar o Mintify?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, perfil: "aluno" })}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      formData.perfil === "aluno" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Comprador</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, perfil: "vendedor" })}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      formData.perfil === "vendedor" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Store className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Vendedor</p>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                  autoComplete="new-password"
                />
              </div>
              {formData.perfil === "vendedor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="chave_pix">Chave PIX para recebimento</Label>
                    <Input
                      id="chave_pix"
                      type="text"
                      placeholder="CPF, e-mail, telefone ou chave aleatoria"
                      value={formData.chave_pix}
                      onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>O que voce vai vender?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo_produto_interesse: "digital" })}
                        className={cn(
                          "rounded-lg border p-3 text-sm font-medium transition-colors",
                          formData.tipo_produto_interesse === "digital"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        Produtos digitais
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo_produto_interesse: "fisico" })}
                        className={cn(
                          "rounded-lg border p-3 text-sm font-medium transition-colors",
                          formData.tipo_produto_interesse === "fisico"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        Produtos fisicos
                      </button>
                    </div>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar agora"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

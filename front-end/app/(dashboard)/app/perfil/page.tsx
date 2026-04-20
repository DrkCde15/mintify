"use client"

import { useState } from "react"
import { User, Lock, Save, Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/store"
import api from "@/lib/api"

export default function PerfilPage() {
  const { usuario } = useAuthStore()
  const [nome, setNome] = useState(usuario?.nome || "")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmaSenha, setConfirmaSenha] = useState("")
  const [salvando, setSalvando] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (novaSenha && novaSenha !== confirmaSenha) {
      toast.error("As senhas não coincidem")
      return
    }

    setSalvando(true)
    try {
      await api.put("/api/usuarios/perfil", {
        nome,
        ...(novaSenha && { senha: novaSenha }),
      })
      toast.success("Perfil atualizado com sucesso!")
      setNovaSenha("")
      setConfirmaSenha("")
    } catch (error) {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {getInitials(usuario?.nome || "U")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Alterar foto</span>
                </Button>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{usuario?.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {usuario?.perfil === "vendedor" ? "Vendedor" : "Aluno"} • Conta ativa
                </p>
              </div>
            </div>

            <Separator />

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="font-medium">Dados Pessoais</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={usuario?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Segurança */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4" />
                Segurança
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Deixe em branco para manter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmaSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmaSenha"
                    type="password"
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={salvando} className="gap-2">
              <Save className="h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

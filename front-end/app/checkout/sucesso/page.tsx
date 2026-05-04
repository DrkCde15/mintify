"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import api from "@/lib/api"
import { toast } from "sonner"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processando seu pagamento...")

  const token = searchParams.get("token") // PayPal Order ID

  useEffect(() => {
    if (token) {
      captureOrder(token)
    } else {
      // Se não tem token, talvez seja um sucesso de outra forma de pagamento (ex: dinheiro)
      setStatus("success")
      setMessage("Sua compra foi registrada com sucesso!")
    }
  }, [token])

  const captureOrder = async (orderId: string) => {
    try {
      const res = await api.post(`/api/paypal/capture-order/${orderId}`)
      if (res.data.status === "success") {
        setStatus("success")
        setMessage("Pagamento confirmado! Seu produto já está disponível.")
        toast.success("Pagamento confirmado!")
      } else {
        setStatus("error")
        setMessage(res.data.message || "Erro ao confirmar pagamento.")
      }
    } catch (err) {
      console.error("Erro ao capturar pedido:", err)
      setStatus("error")
      setMessage("Ocorreu um erro ao processar seu pagamento com o PayPal.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="text-muted-foreground mt-2">Por favor, não feche esta página.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold">Tudo certo!</h1>
          <p className="text-muted-foreground mt-2 mb-8">{message}</p>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/app/meus-cursos")}
              size="lg"
            >
              Ver meus produtos
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              size="lg"
            >
              Voltar para a home
            </Button>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Ops! Algo deu errado</h1>
          <p className="text-muted-foreground mt-2 mb-8">{message}</p>
          <Button
            onClick={() => router.push("/")}
            size="lg"
          >
            Voltar para a home
          </Button>
        </>
      )}
    </div>
  )
}

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h1 className="text-2xl font-bold">Carregando...</h1>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  )
}

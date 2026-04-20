"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  DollarSign,
  User,
  LogOut,
  Store,
  BookOpen,
  Truck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuthStore, useIsVendedor } from "@/lib/store"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const isVendedor = useIsVendedor()

  const vendedorNav: NavItem[] = [
    { href: "/", label: "Vitrine", icon: <Store className="h-5 w-5" /> },
    { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/app/produtos", label: "Meus Produtos", icon: <Package className="h-5 w-5" /> },
    { href: "/app/alunos", label: "Alunos", icon: <Users className="h-5 w-5" /> },
    { href: "/app/financeiro", label: "Financeiro", icon: <DollarSign className="h-5 w-5" /> },
    { href: "/app/vendas", label: "Minhas Vendas", icon: <Truck className="h-5 w-5" /> },
    { href: "/app/perfil", label: "Perfil", icon: <User className="h-5 w-5" /> },
  ]

  const alunoNav: NavItem[] = [
    { href: "/", label: "Vitrine", icon: <Store className="h-5 w-5" /> },
    { href: "/app/meus-cursos", label: "Meus Cursos", icon: <BookOpen className="h-5 w-5" /> },
  ]

  const navItems = isVendedor ? vendedorNav : alunoNav

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app"
    }
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <Link href="/" className="text-2xl font-extrabold text-sidebar-primary">
          Mintify
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  )
}

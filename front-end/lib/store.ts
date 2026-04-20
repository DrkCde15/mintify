import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Usuario } from "./api"

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  setAuth: (token: string, usuario: Usuario) => void
  logout: () => void
  updatePerfil: (perfil: "aluno" | "vendedor") => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,

      setAuth: (token, usuario) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token)
          localStorage.setItem("usuario", JSON.stringify(usuario))
          localStorage.setItem("perfil", usuario.perfil || "")
        }
        set({ token, usuario, isAuthenticated: true })
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          localStorage.removeItem("usuario")
          localStorage.removeItem("perfil")
        }
        set({ token: null, usuario: null, isAuthenticated: false })
      },

      updatePerfil: (perfil) => {
        const { usuario } = get()
        if (usuario) {
          const updated = { ...usuario, perfil }
          if (typeof window !== "undefined") {
            localStorage.setItem("usuario", JSON.stringify(updated))
            localStorage.setItem("perfil", perfil)
          }
          set({ usuario: updated })
        }
      },
    }),
    {
      name: "mintify-auth",
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Hook para verificar se é vendedor
export function useIsVendedor(): boolean {
  const usuario = useAuthStore((state) => state.usuario)
  return usuario?.perfil === "vendedor"
}

// Hook para verificar se é aluno
export function useIsAluno(): boolean {
  const usuario = useAuthStore((state) => state.usuario)
  return usuario?.perfil === "aluno"
}

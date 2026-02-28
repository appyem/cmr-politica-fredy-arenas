// src/lib/auth.ts
import { AUTH_CONFIG } from './auth.config'

export type AuthUser = {
  email: string
  role: 'admin'
}

// Simulación de login (sin base de datos)
export async function login(email: string, password: string): Promise<AuthUser | null> {
  if (
    email === AUTH_CONFIG.admin.email &&
    password === AUTH_CONFIG.admin.password
  ) {
    return {
      email: AUTH_CONFIG.admin.email,
      role: 'admin'
    }
  }
  return null
}

// Verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isLoggedIn') === 'true'
  }
  return false
}

// Guardar sesión
export function setAuthenticated() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isLoggedIn', 'true')
  }
}

// Cerrar sesión
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isLoggedIn')
    window.location.href = '/login'
  }
}
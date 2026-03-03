'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, setAuthenticated } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      if (user) {
        setAuthenticated()
        router.push('/')
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al CRM Político
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@crm-politico.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
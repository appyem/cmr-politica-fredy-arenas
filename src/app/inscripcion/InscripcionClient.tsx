'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface EventoData {
  id: string
  titulo: string
  fecha: string
  hora: string
  ubicacion: string | null
}

interface LiderData {
  id: string
  nombre: string
}

export default function InscripcionClient() {
  const searchParams = useSearchParams()
  const eventoId = searchParams.get('evento')
  const liderId = searchParams.get('lider')

  const [evento, setEvento] = useState<EventoData | null>(null)
  const [lider, setLider] = useState<LiderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados del formulario
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [confirmarCedula, setConfirmarCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Cargar datos del evento y líder
  useEffect(() => {
    const cargarDatos = async () => {
      if (!eventoId || !liderId) {
        setError('Enlace inválido')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/inscripcion?evento=${eventoId}&lider=${liderId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Error al cargar los datos')
          return
        }

        setEvento(data.evento)
        setLider(data.lider)
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [eventoId, liderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cedula !== confirmarCedula) {
      alert('Las cédulas no coinciden')
      return
    }

    if (!cedula || !nombre || !telefono) {
      alert('Todos los campos son obligatorios')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId,
          liderId,
          nombre,
          cedula,
          telefono
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError('Esta cédula ya está registrada')
        } else {
          setError(result.error || 'Error al inscribirse')
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando invitación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold">¡Inscripción exitosa!</h3>
        <p className="text-gray-600 mt-2">Gracias por confirmar tu asistencia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información del evento */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-lg mb-2">{evento?.titulo}</h3>
        <p className="text-sm">
          📅 {new Date(evento?.fecha || '').toLocaleDateString('es-CO')}
          {' '}⏰ {evento?.hora}
          {evento?.ubicacion && ` • 📍 ${evento.ubicacion}`}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="cedula">Cédula *</Label>
          <Input
            id="cedula"
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmarCedula">Confirmar cédula *</Label>
          <Input
            id="confirmarCedula"
            type="text"
            value={confirmarCedula}
            onChange={(e) => setConfirmarCedula(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
          <Input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? 'Inscribiendo...' : 'Confirmar Asistencia'}
        </Button>
      </form>
    </div>
  )
}
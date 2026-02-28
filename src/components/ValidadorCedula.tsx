'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MapPin, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface LugarVotacion {
  ciudad: string
  puesto: string
  mesa: string
  direccion: string
  departamento: string
}

interface ValidacionCedula {
  existe: boolean
  nombre?: string
  lugarVotacion?: LugarVotacion
  error?: string
}

interface ValidadorCedulaProps {
  cedula: string
  onCedulaChange: (cedula: string) => void
  onValidacion: (validacion: any) => void
  onLugarVotacionFound?: (lugar: LugarVotacion) => void  // ← opcional (añade ?)
}

export default function ValidadorCedula({ 
  cedula, 
  onCedulaChange, 
  onValidacion, 
  onLugarVotacionFound 
}: ValidadorCedulaProps) {
  const [validando, setValidando] = useState(false)
  const [validacion, setValidacion] = useState<ValidacionCedula | null>(null)

  const validarCedula = async () => {
    if (!cedula || cedula.length < 7) {
      setValidacion({
        existe: false,
        error: 'La cédula debe tener al menos 7 dígitos'
      })
      onValidacion({
        existe: false,
        error: 'La cédula debe tener al menos 7 dígitos'
      })
      return
    }

    // Validar formato básico
    if (!/^\d+$/.test(cedula)) {
      setValidacion({
        existe: false,
        error: 'La cédula solo debe contener números'
      })
      onValidacion({
        existe: false,
        error: 'La cédula solo debe contener números'
      })
      return
    }

    setValidando(true)
    setValidacion(null)

    try {
      console.log('🔍 Enviando cédula para validación:', cedula)
      
      const response = await fetch('/api/validar-cedula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      })

      const data = await response.json()
      console.log('📋 Respuesta de validación:', data)

      setValidacion(data)
      onValidacion(data)

      // Si existe y tiene lugar de votación, autocompletar
      if (data.existe && data.lugarVotacion) {
        onLugarVotacionFound(data.lugarVotacion)
      }

    } catch (error) {
      console.error('❌ Error validando cédula:', error)
      const errorData = {
        existe: false,
        error: 'Error de conexión. Intente nuevamente.'
      }
      setValidacion(errorData)
      onValidacion(errorData)
    } finally {
      setValidando(false)
    }
  }

  const handleCedulaChange = (value: string) => {
    // Solo permitir números
    const soloNumeros = value.replace(/\D/g, '')
    onCedulaChange(soloNumeros)
    
    // Limpiar validación anterior si cambia la cédula
    if (validacion) {
      setValidacion(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      validarCedula()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cedula" className="text-sm font-medium text-gray-700">
          Cédula de Ciudadanía *
        </Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="cedula"
              type="text"
              value={cedula}
              onChange={(e) => handleCedulaChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: 801234567"
              className="pr-10"
              maxLength={10}
              disabled={validando}
            />
            {validando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <Button 
            onClick={validarCedula}
            disabled={validando || !cedula || cedula.length < 7}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {validando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Validar
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Ingresa solo números. La validación se realizará en tiempo real.
        </p>
      </div>

      {/* Resultados de Validación */}
      {validacion && (
        <Card className={`border-l-4 ${
          validacion.existe 
            ? 'border-l-green-500 bg-green-50' 
            : 'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              {validacion.existe ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              
              <div className="flex-1">
                {validacion.existe ? (
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-green-800">
                        ✅ Cédula válida y registrada
                      </p>
                      {validacion.nombre && (
                        <p className="text-sm text-green-700">
                          Nombre: {validacion.nombre}
                        </p>
                      )}
                    </div>

                    {validacion.lugarVotacion && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-green-600 mr-2" />
                          <p className="font-medium text-green-800">
                            Lugar de Votación
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Ciudad:</span>
                            <span className="ml-2 font-medium">{validacion.lugarVotacion.ciudad}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Departamento:</span>
                            <span className="ml-2 font-medium">{validacion.lugarVotacion.departamento}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Puesto:</span>
                            <span className="ml-2 font-medium">{validacion.lugarVotacion.puesto}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mesa:</span>
                            <span className="ml-2 font-medium">{validacion.lugarVotacion.mesa}</span>
                          </div>
                          {validacion.lugarVotacion.direccion && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Dirección:</span>
                              <span className="ml-2 font-medium">{validacion.lugarVotacion.direccion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-red-800">
                      ❌ Cédula no registrada
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {validacion.error || 'La cédula no se encuentra en el censo electoral.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información importante:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• La validación se realiza en tiempo real con la Registraduría</li>
              <li>• Los datos de votación se autocompletarán automáticamente</li>
              <li>• Esta información es confidencial y se usa solo para fines estadísticos</li>
              <li>• Si hay errores, espere unos minutos e intente nuevamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
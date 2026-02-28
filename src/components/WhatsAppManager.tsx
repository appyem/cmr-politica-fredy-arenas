'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail,
  Plus,
  Search,
  MoreHorizontal
} from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  estado: string
}

interface Conversacion {
  id: string
  clienteId: string
  mensaje: string
  tipo: string
  plataforma: string
  fecha: string
  cliente: {
    nombre: string
    email: string
    telefono?: string
  }
}

interface WhatsAppManagerProps {
  clientes: Cliente[]
}

export default function WhatsAppManager({ clientes }: WhatsAppManagerProps) {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConversaciones()
  }, [])

  const fetchConversaciones = async () => {
    try {
      const response = await fetch('/api/conversaciones')
      if (response.ok) {
        const data = await response.json()
        setConversaciones(data)
      }
    } catch (error) {
      console.error('Error fetching conversaciones:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedCliente || !mensaje.trim()) {
      alert('Por favor selecciona un cliente y escribe un mensaje')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/conversaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId: selectedCliente.id,
          mensaje: mensaje.trim(),
          tipo: 'enviado',
          plataforma: 'whatsapp'
        }),
      })

      if (response.ok) {
        setMensaje('')
        setShowNewMessage(false)
        setSelectedCliente(null)
        fetchConversaciones()
        alert('Mensaje enviado correctamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al enviar mensaje')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar mensaje')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar conversaciones por término de búsqueda
  const conversacionesFiltradas = conversaciones.filter(conv =>
    conv.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Agrupar conversaciones por cliente
  const conversacionesPorCliente = conversacionesFiltradas.reduce((acc, conv) => {
    if (!acc[conv.clienteId]) {
      acc[conv.clienteId] = {
        cliente: conv.cliente,
        mensajes: []
      }
    }
    acc[conv.clienteId].mensajes.push(conv)
    return acc
  }, {} as Record<string, { cliente: any; mensajes: Conversacion[] }>)

  const stats = {
    enviadosHoy: conversaciones.filter(c => 
      c.tipo === 'enviado' && 
      new Date(c.fecha).toDateString() === new Date().toDateString()
    ).length,
    recibidosHoy: conversaciones.filter(c => 
      c.tipo === 'recibido' && 
      new Date(c.fecha).toDateString() === new Date().toDateString()
    ).length,
    conversacionesActivas: Object.keys(conversacionesPorCliente).length,
    totalMensajes: conversaciones.length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">WhatsApp Business</h2>
          <p className="text-gray-600">Comunícate directamente con tus clientes</p>
        </div>
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Conversación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Mensaje de WhatsApp</DialogTitle>
              <DialogDescription>
                Envía un nuevo mensaje a un cliente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select onValueChange={(value) => {
                  const cliente = clientes.find(c => c.id === value)
                  setSelectedCliente(cliente || null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCliente && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">{selectedCliente.nombre}</p>
                  <p className="text-sm text-gray-600">{selectedCliente.email}</p>
                  {selectedCliente.telefono && (
                    <p className="text-sm text-gray-600">{selectedCliente.telefono}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewMessage(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !selectedCliente || !mensaje.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mensajes Enviados Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enviadosHoy}</div>
            <p className="text-xs text-gray-600">Via WhatsApp</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mensajes Recibidos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recibidosHoy}</div>
            <p className="text-xs text-gray-600">De clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversaciones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversacionesActivas}</div>
            <p className="text-xs text-gray-600">Clientes distintos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMensajes}</div>
            <p className="text-xs text-gray-600">En el historial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversaciones Activas</CardTitle>
            <CardDescription>Chats en curso con clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(conversacionesPorCliente).map(({ cliente, mensajes }) => (
                <div key={cliente.nombre} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{cliente.nombre}</span>
                      <span className="text-sm text-gray-500">{cliente.email}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(mensajes[0].fecha).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {mensajes.slice(0, 3).map((msg) => (
                      <div key={msg.id} className={`flex ${msg.tipo === 'enviado' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.tipo === 'enviado' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {msg.mensaje}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" variant="outline">
                      Ver Chat Completo
                    </Button>
                    <Button size="sm">
                      Responder
                    </Button>
                  </div>
                </div>
              ))}
              
              {Object.keys(conversacionesPorCliente).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay conversaciones activas</p>
                  <p className="text-sm">Envía tu primer mensaje para comenzar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Actividad</CardTitle>
            <CardDescription>Últimas interacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversacionesFiltradas.slice(0, 10).map((conv) => (
                <div key={conv.id} className="flex items-start space-x-3 pb-3 border-b">
                  <div className="shrink-0 mt-1">
                    {conv.tipo === 'enviado' ? (
                      <Send className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.cliente.nombre}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{conv.mensaje}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.fecha).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {conversacionesFiltradas.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  empresa?: string
  estado: string
  direccion?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

interface ClienteFormProps {
  cliente?: Cliente
  onSave: (cliente: Partial<Cliente>) => void
  onCancel: () => void
}

function ClienteForm({ cliente, onSave, onCancel }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nombre: cliente?.nombre || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
    empresa: cliente?.empresa || '',
    estado: cliente?.estado || 'potencial',
    direccion: cliente?.direccion || '',
    notas: cliente?.notas || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            id="empresa"
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="potencial">Potencial</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="notas">Notas</Label>
        <Textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {cliente ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

interface ClientesManagerProps {
  clientes: Cliente[]
  onClienteChange: () => void
}

export default function ClientesManager({ clientes, onClienteChange }: ClientesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>()
  const [loading, setLoading] = useState(false)

  const handleSave = async (clienteData: Partial<Cliente>) => {
    setLoading(true)
    try {
      const url = editingCliente 
        ? `/api/clientes/${editingCliente.id}`
        : '/api/clientes'
      
      const method = editingCliente ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCliente(undefined)
        onClienteChange()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar cliente')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clienteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clientes/${clienteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onClienteChange()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar cliente')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingCliente(undefined)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingCliente(undefined)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.email}</div>
                    <div className="text-sm text-gray-500">{cliente.telefono || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cliente.empresa || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.estado === 'activo' 
                        ? 'bg-green-100 text-green-800'
                        : cliente.estado === 'potencial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cliente.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(cliente.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCliente 
                ? 'Edita la información del cliente seleccionado'
                : 'Completa el formulario para agregar un nuevo cliente'
              }
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            cliente={editingCliente}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
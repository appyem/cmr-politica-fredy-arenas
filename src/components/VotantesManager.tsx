'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ValidadorCedula from '@/components/ValidadorCedula'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Download,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Users,
  Search,
  Filter
} from 'lucide-react'

interface Votante {
  id: string
  nombre: string
  cedula: string
  email?: string
  telefono?: string
  whatsapp?: string
  instagram?: string
  edad?: number
  genero?: string
  estado: string
  departamento?: string
  municipio?: string
  barrio?: string
  // Lugar de votación (campos planos desde Prisma)
  lugarCiudad?: string
  lugarPuesto?: string
  lugarMesa?: string
  lugarDireccion?: string
  lugarDepartamento?: string
  ocupacion?: string
  nivelEstudio?: string
  intereses?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

interface VotantesManagerProps {
  votantes: Votante[]
  onVotanteChange: () => void
}

function VotanteForm({ votante, onSave, onCancel }: { 
  votante?: Votante
  onSave: (votante: Partial<Votante>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nombre: votante?.nombre || '',
    cedula: votante?.cedula || '',
    email: votante?.email || '',
    telefono: votante?.telefono || '',
    whatsapp: votante?.whatsapp || '',
    instagram: votante?.instagram || '',
    edad: votante?.edad?.toString() || '',
    genero: votante?.genero || '',
    estado: votante?.estado || 'potencial',
    departamento: votante?.departamento || '',
    municipio: votante?.municipio || '',
    barrio: votante?.barrio || '',
    
    ocupacion: votante?.ocupacion || '',
    nivelEstudio: votante?.nivelEstudio || '',
    intereses: votante?.intereses || '',
    notas: votante?.notas || ''
  })

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSave({
      ...formData,
      edad: formData.edad ? parseInt(formData.edad) : undefined,
    })
  }

  const handleCedulaChange = (cedula: string) => {
    setFormData({ ...formData, cedula })
    // Limpiar validación anterior
    
  }

  const handleValidacionCedula = (validacion: any) => {
    
  }

  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
        <Label htmlFor="cedula">Cédula *</Label>
        <Input
          id="cedula"
          value={formData.cedula}
          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
          placeholder="Ingrese número de cédula"
          required
        />
      </div>
        <div>
          <Label htmlFor="nombre">Nombre Completo *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edad">Edad</Label>
          <Input
            id="edad"
            type="number"
            value={formData.edad}
            onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="genero">Género</Label>
          <Select value={formData.genero} onValueChange={(value) => setFormData({ ...formData, genero: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="potencial">Potencial</SelectItem>
            <SelectItem value="simpatizante">Simpatizante</SelectItem>
            <SelectItem value="voluntario">Voluntario</SelectItem>
            <SelectItem value="indeciso">Indeciso</SelectItem>
            <SelectItem value="lider">Líder</SelectItem>
            <SelectItem value="coordinador">Coordinador</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departamento">Departamento</Label>
          <Input
            id="departamento"
            value={formData.departamento}
            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
          />
        </div>
        {['lider', 'coordinador'].includes(formData.estado) ? (
  <div>
    <Label htmlFor="municipio">Municipio *</Label>
    <Select 
      value={formData.municipio || ''}
      onValueChange={(value) => setFormData({ ...formData, municipio: value })}
    >
      <SelectTrigger id="municipio">
        <SelectValue placeholder="Seleccione un municipio" />
      </SelectTrigger>
      <SelectContent>
        {[
          'Aguadas',
          'Anserma',
          'Aranzazu',
          'Belalcázar',
          'Chinchiná',
          'Filadelfia',
          'La Dorada',
          'La Merced',
          'Manizales',
          'Manzanares',
          'Marmato',
          'Marquetalia',
          'Marulanda',
          'Neira',
          'Norcasia',
          'Pácora',
          'Palestina',
          'Pensilvania',
          'Riosucio',
          'Risaralda',
          'Salamina',
          'Samaná',
          'San José',
          'Supía',
          'Victoria',
          'Villamaría',
          'Viterbo'
        ].map(municipio => (
          <SelectItem key={municipio} value={municipio}>
            {municipio}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
) : (
  <div>
    <Label htmlFor="municipio">Municipio</Label>
    <Input
      id="municipio"
      value={formData.municipio}
      onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
    />
  </div>
)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!['lider', 'coordinador'].includes(formData.estado) && (
        <div>
          <Label htmlFor="barrio">Barrio</Label>
          <Input
            id="barrio"
            value={formData.barrio}
            onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}
          />
        </div>
      )}
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ocupacion">Ocupación</Label>
          <Input
            id="ocupacion"
            value={formData.ocupacion}
            onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="nivelEstudio">Nivel de Estudio</Label>
          <Select value={formData.nivelEstudio} onValueChange={(value) => setFormData({ ...formData, nivelEstudio: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primaria">Primaria</SelectItem>
              <SelectItem value="secundaria">Secundaria</SelectItem>
              <SelectItem value="preparatoria">Preparatoria</SelectItem>
              <SelectItem value="universidad">Universidad</SelectItem>
              <SelectItem value="posgrado">Posgrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="intereses">Intereses (separados por comas)</Label>
        <Input
          id="intereses"
          value={formData.intereses}
          onChange={(e) => setFormData({ ...formData, intereses: e.target.value })}
          placeholder="Ej: Política, Educación, Salud"
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
          {votante ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

function ImportExcel({ onImportSuccess }: { onImportSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownloadTemplate = async () => {
    setDownloading(true)
    try {
      const response = await fetch('/api/import')
      if (response.ok) {
        const data = await response.json()
        
        // Crear contenido CSV simple para descarga
        const csvContent = [
          'cedula,nombre,email,telefono,whatsapp,instagram,edad,genero,estado,departamento,municipio,barrio,sitioVotacion,ocupacion,nivelEstudio,intereses,notas',
          '801234567,Juan Pérez,juan@email.com,3001234567,3001234567,@juanperez,25,masculino,simpatizante,Cundinamarca,Bogotá,Chapinero,Puesto 123 - Mesa 5,Estudiante,Universidad,Política,Deportes,Votante comprometido'
        ].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'modelo_votantes.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error al descargar modelo')
    } finally {
      setDownloading(false)
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        onImportSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al importar')
      }
    } catch (error) {
      console.error('Error importing:', error)
      alert('Error al importar archivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Importar Votantes desde Excel</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Instrucciones:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Descarga el modelo de Excel para asegurar el formato correcto</li>
            <li>• Las columnas "cedula" y "nombre" son obligatorias</li>
            <li>• Puedes dejar las demás columnas vacías si no tienes la información</li>
            <li>• Los estados válidos son: potencial, simpatizante, voluntario, indeciso</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleDownloadTemplate}
            disabled={downloading}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Descargando...' : 'Descargar Modelo de Excel'}
          </Button>

          <div>
            <Label htmlFor="file">Seleccionar archivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
          </div>

          <Button 
            onClick={handleImport}
            disabled={loading || !file}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Importando...' : 'Importar Votantes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MensajeriaMasiva({ votantes }: { votantes: Votante[] }) {
  const [selectedVotantes, setSelectedVotantes] = useState<string[]>([])
  const [plataforma, setPlataforma] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [asunto, setAsunto] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!plataforma || !mensaje || selectedVotantes.length === 0) {
      alert('Por favor completa todos los campos y selecciona votantes')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plataforma,
          mensaje,
          asunto: plataforma === 'email' ? asunto : undefined,
          votantesSeleccionados: selectedVotantes,
          tipo: 'masivo'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setSelectedVotantes([])
        setMensaje('')
        setAsunto('')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al enviar mensajes')
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      alert('Error al enviar mensajes')
    } finally {
      setLoading(false)
    }
  }

  const toggleVotanteSelection = (votanteId: string) => {
    setSelectedVotantes(prev => 
      prev.includes(votanteId) 
        ? prev.filter(id => id !== votanteId)
        : [...prev, votanteId]
    )
  }

  const selectAllVotantes = () => {
    setSelectedVotantes(votantes.map(v => v.id))
  }

  const clearSelection = () => {
    setSelectedVotantes([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Mensajería Masiva</h3>
        
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Redactar Mensaje</TabsTrigger>
            <TabsTrigger value="select">Seleccionar Votantes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={plataforma === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setPlataforma('whatsapp')}
                className="h-16 flex-col"
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                WhatsApp
              </Button>
              <Button 
                variant={plataforma === 'email' ? 'default' : 'outline'}
                onClick={() => setPlataforma('email')}
                className="h-16 flex-col"
              >
                <Mail className="h-6 w-6 mb-2" />
                Email
              </Button>
              <Button 
                variant={plataforma === 'sms' ? 'default' : 'outline'}
                onClick={() => setPlataforma('sms')}
                className="h-16 flex-col"
              >
                <Phone className="h-6 w-6 mb-2" />
                SMS
              </Button>
              <Button 
                variant={plataforma === 'instagram' ? 'default' : 'outline'}
                onClick={() => setPlataforma('instagram')}
                className="h-16 flex-col"
              >
                <Users className="h-6 w-6 mb-2" />
                Instagram
              </Button>
            </div>

            {plataforma === 'email' && (
              <div>
                <Label htmlFor="asunto">Asunto</Label>
                <Input
                  id="asunto"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Asunto del correo"
                />
              </div>
            )}

            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe tu mensaje aquí. Usa {nombre} para personalizar con el nombre del votante..."
                rows={6}
              />
              <div className="text-sm text-gray-500 mt-2">
                Variables disponibles: {'{nombre}'}, {'{email}'}, {'{telefono}'}, {'{whatsapp}'}, {'{edad}'}, {'{género}'}, {'{departamento}'}, {'{municipio}'}, {'{barrio}'}, {'{ocupación}'}, {'{nivelEstudio}'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Vista Previa:</h4>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm">
                  {mensaje.replace(/\{nombre\}/g, '[Nombre del Votante]') || 'Escribe un mensaje para ver la vista previa...'}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="select" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                Seleccionados: {selectedVotantes.length} de {votantes.length}
              </h4>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllVotantes}>
                  Seleccionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Limpiar Selección
                </Button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {votantes.map((votante) => (
                <div 
                  key={votante.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 border-b"
                >
                  <input
                    type="checkbox"
                    checked={selectedVotantes.includes(votante.id)}
                    onChange={() => toggleVotanteSelection(votante.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{votante.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {votante.municipio} - Barrio {votante.barrio}
                    </p>
                  </div>
                  <Badge variant={
                    votante.estado === 'simpatizante' ? 'default' :
                    votante.estado === 'voluntario' ? 'secondary' :
                    'outline'
                  }>
                    {votante.estado}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleSend}
          disabled={loading || !plataforma || !mensaje || selectedVotantes.length === 0}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Enviando...' : `Enviar Mensaje Masivo (${selectedVotantes.length} votantes)`}
        </Button>
      </div>
    </div>
  )
}

export default function VotantesManager({ votantes, onVotanteChange }: VotantesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingVotante, setEditingVotante] = useState<Votante | undefined>()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('lista')
  const [filtroCedula, setFiltroCedula] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMunicipio, setFiltroMunicipio] = useState('todos')


     // Filtrar votantes según cédula, estado y municipio
    const votantesFiltrados = votantes.filter(votante => {
      const coincideCedula = !filtroCedula || 
        votante.cedula.toLowerCase().includes(filtroCedula.toLowerCase())
      
      const coincideEstado = filtroEstado === 'todos' || 
        votante.estado === filtroEstado
      
      const coincideMunicipio = filtroMunicipio === 'todos' || 
        votante.municipio === filtroMunicipio
      
      return coincideCedula && coincideEstado && coincideMunicipio
    })



  const handleSave = async (votanteData: Partial<Votante>) => {
    setLoading(true)
    try {
      const url = editingVotante 
        ? `/api/votantes/${editingVotante.id}`
        : '/api/votantes'
      
      const method = editingVotante ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(votanteData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingVotante(undefined)
        onVotanteChange()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar votante')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar votante')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (votanteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este votante?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/votantes/${votanteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onVotanteChange()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar votante')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar votante')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (votante: Votante) => {
    setEditingVotante(votante)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingVotante(undefined)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingVotante(undefined)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión de Votantes</h2>
            <p className="text-gray-600">Base de datos de electores</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNew}>
              <Users className="h-4 w-4 mr-2" />
              Agregar Votante
            </Button>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label htmlFor="filtroCedula" className="text-sm text-gray-600">Buscar por cédula</Label>
            <Input
              id="filtroCedula"
              placeholder="Ingrese cédula..."
              value={filtroCedula}
              onChange={(e) => setFiltroCedula(e.target.value)}
              className="mt-1"
            />
          </div>
         <div className="flex flex-col sm:flex-row gap-3 w-full">
          <div className="w-full sm:w-48">
            <Label htmlFor="filtroEstado" className="text-sm text-gray-600">Filtrar por estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger id="filtroEstado" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="potencial">Potencial</SelectItem>
                <SelectItem value="simpatizante">Simpatizante</SelectItem>
                <SelectItem value="voluntario">Voluntario</SelectItem>
                <SelectItem value="indeciso">Indeciso</SelectItem>
                <SelectItem value="lider">Líder</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="filtroMunicipio" className="text-sm text-gray-600">Filtrar por municipio</Label>
            <Select value={filtroMunicipio} onValueChange={setFiltroMunicipio}>
              <SelectTrigger id="filtroMunicipio" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los municipios</SelectItem>
                {[
                  'Aguadas',
                  'Anserma',
                  'Aranzazu',
                  'Belalcázar',
                  'Chinchiná',
                  'Filadelfia',
                  'La Dorada',
                  'La Merced',
                  'Manizales',
                  'Manzanares',
                  'Marmato',
                  'Marquetalia',
                  'Marulanda',
                  'Neira',
                  'Norcasia',
                  'Pácora',
                  'Palestina',
                  'Pensilvania',
                  'Riosucio',
                  'Risaralda',
                  'Salamina',
                  'Samaná',
                  'San José',
                  'Supía',
                  'Victoria',
                  'Villamaría',
                  'Viterbo'
                ].map(municipio => (
                  <SelectItem key={municipio} value={municipio}>
                    {municipio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Votantes</TabsTrigger>
          <TabsTrigger value="importar">Importar Excel</TabsTrigger>
          <TabsTrigger value="mensajeria">Mensajería Masiva</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Cédula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Votante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Lugar Votación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {votantesFiltrados.map((votante) => (
                      <tr key={votante.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{votante.cedula}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{votante.nombre}</div>
                          <div className="text-sm text-gray-500">
                            {votante.edad} años • {votante.genero}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {votante.telefono || votante.whatsapp || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{votante.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{votante.municipio || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Barrio {votante.barrio || 'N/A'}</div>
                        </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {votante.lugarPuesto ? `${votante.lugarPuesto} - Mesa ${votante.lugarMesa || ''}` : 'N/A'}
                          </div>
                       </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              votante.estado === 'simpatizante' ? 'default' :
                              votante.estado === 'voluntario' ? 'secondary' :
                              'outline'
                            }
                            className={
                              votante.estado === 'simpatizante' ? 'bg-green-100 text-green-800' :
                              votante.estado === 'voluntario' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {votante.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(votante)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(votante.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="importar">
          <Card>
            <CardHeader>
              <CardTitle>Importar Votantes desde Excel</CardTitle>
              <CardDescription>
                Importa múltiples votantes desde un archivo Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportExcel onImportSuccess={onVotanteChange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mensajeria">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensajes Masivos</CardTitle>
              <CardDescription>
                Comunicación directa con múltiples votantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MensajeriaMasiva votantes={votantes} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVotante ? 'Editar Votante' : 'Agregar Nuevo Votante'}
            </DialogTitle>
            <DialogDescription>
              {editingVotante 
                ? 'Edita la información del votante seleccionado'
                : 'Completa el formulario para agregar un nuevo votante. La cédula se validará en tiempo real.'
              }
            </DialogDescription>
          </DialogHeader>
          <VotanteForm
            votante={editingVotante}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
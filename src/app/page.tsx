'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Mail,
  Phone,
  Upload,
  Send,
  Megaphone,
  Target,
  BarChart3,
  MapPin,
  Star,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Filter,
  Search,
  HelpCircle
} from 'lucide-react'
import VotantesManager from '@/components/VotantesManager'

// Lista de municipios de Caldas en orden alfabético
const MUNICIPIOS_CALDAS = [
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
].sort(); // Asegura orden alfabético

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

interface Campana {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  estado: 'activa' | 'pausada' | 'finalizada'
  objetivo: string
  mensajesEnviados: number
  createdAt: string
}

interface Inscripcion {
id: string
nombre: string
cedula: string
telefono: string
createdAt: string
liderId: string
}

interface Evento {
id: string
titulo: string
descripcion: string
fecha: string
hora: string
ubicacion: string
tipo: 'reunion' | 'concentracion' | 'debate' | 'visita'
estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado'
asistentes: string[]
createdAt: string
liderId?: string
lideres: { id: string; nombre: string }[]
inscripciones: Inscripcion[]
totalInscritos: number
}

interface Plantilla {
  id: string
  nombre: string
  tipo: 'whatsapp' | 'email' | 'sms'
  asunto?: string
  contenido: string
  variables: string[]
  createdAt: string
}

export default function PoliticalCRM() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [votantes, setVotantes] = useState<Votante[]>([])
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [showCampanaForm, setShowCampanaForm] = useState(false)
  const [showEventoForm, setShowEventoForm] = useState(false)
  const [showPlantillaForm, setShowPlantillaForm] = useState(false)
  const [editingCampana, setEditingCampana] = useState<Campana | undefined>()
  const [editingEvento, setEditingEvento] = useState<Evento | undefined>()
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | undefined>()
  // Estados para mensajería masiva
  const [filtroEstadoMensajeria, setFiltroEstadoMensajeria] = useState('todos')
  const [busquedaMensajeria, setBusquedaMensajeria] = useState('')
  const [votantesSeleccionados, setVotantesSeleccionados] = useState<Set<string>>(new Set())
  const [plataformaMensajeria, setPlataformaMensajeria] = useState('whatsapp')
  const [asuntoMensajeria, setAsuntoMensajeria] = useState('')
  const [mensajeMensajeria, setMensajeMensajeria] = useState('')


  // Estados para campaña de invitación
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [filtroEstadoLideres, setFiltroEstadoLideres] = useState('todos')
  const [busquedaLideres, setBusquedaLideres] = useState('')
  const [lideresSeleccionados, setLideresSeleccionados] = useState<Set<string>>(new Set())
  const [filtroMunicipioLideres, setFiltroMunicipioLideres] = useState('todos')

// Líderes filtrados para campaña de invitación
const lideresFiltrados = votantes.filter(v => {
  const rolesValidos = ['potencial', 'simpatizante', 'voluntario', 'indeciso', 'lider', 'coordinador']
  const esRolValido = rolesValidos.includes(v.estado)
  const coincideEstado = 
    filtroEstadoLideres === 'todos' || 
    v.estado === filtroEstadoLideres
  const coincideMunicipio = 
    filtroMunicipioLideres === 'todos' || 
    v.municipio === filtroMunicipioLideres
  const coincideBusqueda = !busquedaLideres ||
    v.nombre.toLowerCase().includes(busquedaLideres.toLowerCase()) ||
    v.cedula.includes(busquedaLideres)
  return esRolValido && coincideEstado && coincideMunicipio && coincideBusqueda
})



  // Votantes filtrados para mensajería
  const votantesFiltradosMensajeria = votantes.filter(votante => {
    const coincideEstado = filtroEstadoMensajeria === 'todos' || votante.estado === filtroEstadoMensajeria
    const coincideBusqueda = !busquedaMensajeria ||
      votante.nombre.toLowerCase().includes(busquedaMensajeria.toLowerCase()) ||
      votante.cedula.includes(busquedaMensajeria)
    return coincideEstado && coincideBusqueda
  })




  useEffect(() => {
    fetchVotantes()
    fetchCampanas()
    fetchEventos()
    fetchPlantillas()
  }, [])

  const fetchVotantes = async () => {
    try {
      const response = await fetch('/api/votantes')
      if (response.ok) {
        const data = await response.json()
        setVotantes(data)
      }
    } catch (error) {
      console.error('Error fetching votantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampanas = async () => {
    try {
      const response = await fetch('/api/campanas')
      if (response.ok) {
        const data = await response.json()
        setCampanas(data)
      }
    } catch (error) {
      console.error('Error fetching campanas:', error)
    }
  }

  const fetchEventos = async () => {
    try {
      const response = await fetch('/api/eventos')
      if (response.ok) {
        const data = await response.json()
        setEventos(data)
      }
    } catch (error) {
      console.error('Error fetching eventos:', error)
    }
  }

  const fetchPlantillas = async () => {
    try {
      const response = await fetch('/api/plantillas')
      if (response.ok) {
        const data = await response.json()
        setPlantillas(data)
      }
    } catch (error) {
      console.error('Error fetching plantillas:', error)
    }
  }

  // Calcular estadísticas políticas
// Calcular estadísticas políticas
const stats = [
  {
    title: 'Total Votantes',
    value: votantes.length.toString(),
    icon: Users,
    change: '+15%',
    positive: true,
    color: 'bg-blue-500'
  },
  {
    title: 'Potenciales',
    value: votantes.filter(v => v.estado === 'potencial').length.toString(),
    icon: Search,
    change: '+10%',
    positive: true,
    color: 'bg-gray-500'
  },
  {
    title: 'Simpatizantes',
    value: votantes.filter(v => v.estado === 'simpatizante').length.toString(),
    icon: Star,
    change: '+8%',
    positive: true,
    color: 'bg-green-500'
  },
  {
    title: 'Voluntarios',
    value: votantes.filter(v => v.estado === 'voluntario').length.toString(),
    icon: Target,
    change: '+12%',
    positive: true,
    color: 'bg-purple-500'
  },
  {
    title: 'Líderes',
    value: votantes.filter(v => v.estado === 'lider').length.toString(),
    icon: TrendingUp,
    change: '+7%',
    positive: true,
    color: 'bg-blue-600'
  },
  {
    title: 'Coordinadores',
    value: votantes.filter(v => v.estado === 'coordinador').length.toString(),
    icon: MapPin,
    change: '+5%',
    positive: true,
    color: 'bg-indigo-600'
  },
  {
    title: 'Indecisos',
    value: votantes.filter(v => v.estado === 'indeciso').length.toString(),
    icon: HelpCircle,
    change: '+5%',
    positive: false,
    color: 'bg-yellow-500'
  },
  {
    title: 'Mensajes Enviados',
    value: campanas.reduce((total, c) => total + c.mensajesEnviados, 0).toString(),
    icon: Send,
    change: '+23%',
    positive: true,
    color: 'bg-orange-500'
  }
]

  const votantesRecientes = votantes.slice(0, 4)
  const barriosActivos = Array.from(new Set(votantes.map(v => v.barrio).filter(Boolean))).slice(0, 5)
  const campanasActivas = campanas.filter(c => c.estado === 'activa')
  const eventosProximos = eventos.filter(e => e.estado === 'programado').slice(0, 3)

  // Calcular tasa de conversión de indecisos a simpatizantes
  const indecisos = votantes.filter(v => v.estado === 'indeciso').length
  const simpatizantes = votantes.filter(v => v.estado === 'simpatizante').length
  const tasaConversionIndecisos = indecisos > 0 ? Math.round((simpatizantes / (indecisos + simpatizantes)) * 100) : 0

  // Métrica: Votantes listos para movilizar
  const votantesListos = votantes.filter(v => 
    v.cedula && 
    v.whatsapp && 
    v.municipio && 
    v.barrio && 
    v.lugarPuesto
  ).length

  const porcentajeListos = Math.round(
    (votantesListos / Math.max(votantes.length, 1)) * 100
  )

  // Métrica: Total de inscritos a reuniones
  const totalInscritos = eventos.reduce((total, evento) => {
    return total + (evento.totalInscritos || 0)
  }, 0)


  // Métrica: Top 5 líderes con más confirmaciones
  const lideresMap = new Map<string, { id: string; nombre: string; count: number }>()

  // Recorrer todos los eventos e inscripciones
  eventos.forEach(evento => {
    if (evento.inscripciones) {
      evento.inscripciones.forEach(inscripcion => {
        const liderId = inscripcion.liderId
        if (liderId) {
          if (!lideresMap.has(liderId)) {
            // Buscar el nombre del líder en la lista de votantes
            const liderVotante = votantes.find(v => v.id === liderId)
            lideresMap.set(liderId, {
              id: liderId,
              nombre: liderVotante?.nombre || 'Líder desconocido',
              count: 0
            })
          }
          const current = lideresMap.get(liderId)!
          lideresMap.set(liderId, { ...current, count: current.count + 1 })
        }
      })
    }
  })

  // Convertir a array y ordenar
  const lideresArray = Array.from(lideresMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const totalLideresActivos = lideresArray.length

  

  // Funciones para manejar campañas
  const handleSaveCampana = async (campanaData: Partial<Campana>) => {
    try {
      const url = editingCampana ? `/api/campanas/${editingCampana.id}` : '/api/campanas'
      const method = editingCampana ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campanaData)
      })

      if (response.ok) {
        setShowCampanaForm(false)
        setEditingCampana(undefined)
        fetchCampanas()
      }
    } catch (error) {
      console.error('Error saving campana:', error)
    }
  }

  const handleDeleteCampana = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta campaña?')) return
    
    try {
      const response = await fetch(`/api/campanas/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchCampanas()
      }
    } catch (error) {
      console.error('Error deleting campana:', error)
    }
  }

  // Funciones para manejar eventos
  const handleSaveEvento = async (eventoData: Partial<Evento>) => {
    try {
      const url = editingEvento ? `/api/eventos/${editingEvento.id}` : '/api/eventos'
      const method = editingEvento ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoData)
      })

      if (response.ok) {
        setShowEventoForm(false)
        setEditingEvento(undefined)
        fetchEventos()
      }
    } catch (error) {
      console.error('Error saving evento:', error)
    }
  }

  const handleDeleteEvento = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return
    
    try {
      const response = await fetch(`/api/eventos/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchEventos()
      }
    } catch (error) {
      console.error('Error deleting evento:', error)
    }
  }

  // Funciones para manejar 
  const handleSavePlantilla = async (plantillaData: Partial<Plantilla>) => {
    try {
      const url = editingPlantilla ? `/api/plantillas/${editingPlantilla.id}` : '/api/plantillas'
      const method = editingPlantilla ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plantillaData)
      })

      if (response.ok) {
        setShowPlantillaForm(false)
        setEditingPlantilla(undefined)
        fetchPlantillas()
      }
    } catch (error) {
      console.error('Error saving plantilla:', error)
    }
  }

  const handleDeletePlantilla = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return
    
    try {
      const response = await fetch(`/api/plantillas/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchPlantillas()
      }
    } catch (error) {
      console.error('Error deleting plantilla:', error)
    }
  }


  // Función para enviar mensajes masivos
  const handleEnviarMensajes = async () => {
    if (votantesSeleccionados.size === 0 || !mensajeMensajeria.trim()) {
      alert('Selecciona votantes y escribe un mensaje')
      return
    }

    const confirmacion = confirm(`¿Estás seguro de enviar el mensaje a ${votantesSeleccionados.size} votantes?`)
    if (!confirmacion) return

    try {
      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plataforma: plataformaMensajeria,
          mensaje: mensajeMensajeria,
          asunto: plataformaMensajeria === 'email' ? asuntoMensajeria : undefined,
          votantesSeleccionados: Array.from(votantesSeleccionados)
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        // Opcional: limpiar selección y mensaje
        setVotantesSeleccionados(new Set())
        setMensajeMensajeria('')
        setAsuntoMensajeria('')
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al enviar mensajes:', error)
      alert('Error al enviar mensajes')
    }
  }


  // Función para enviar invitaciones a líderes
  const handleEnviarInvitaciones = async () => {
    if (!selectedEvento || lideresSeleccionados.size === 0) {
      alert('Seleccione un evento y al menos un líder')
      return
    }

    const confirmacion = confirm(`¿Estás seguro de enviar invitaciones a ${lideresSeleccionados.size} líderes?`)
    if (!confirmacion) return

    try {
      // Preparar mensaje personalizado para cada líder
      const mensajes = Array.from(lideresSeleccionados).map(liderId => {
        const lider = votantes.find(v => v.id === liderId)
        if (!lider) return null
        
        const enlace = `${window.location.origin}/inscripcion?evento=${selectedEvento.id}&lider=${liderId}`
        const mensaje = `¡Hola ${lider.nombre}! Te invitamos a liderar en el evento "${selectedEvento.titulo}".\n\nDesde el siguiente enlace podrás inscribir a tus invitados:\n${enlace}`
        
        return {
          votanteId: liderId,
          plataforma: 'whatsapp',
          mensaje
        }
      }).filter(Boolean)

      if (mensajes.length === 0) {
        alert('No se pudieron generar los mensajes')
        return
      }

      // Enviar a la API de mensajes
      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plataforma: 'whatsapp',
          tipo: 'invitacion',
          votantesSeleccionados: Array.from(lideresSeleccionados),
          variables: {
            evento: selectedEvento.titulo
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ ${result.message}`)
        // Limpiar selección
        setLideresSeleccionados(new Set())
        setSelectedEvento(null)
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al enviar invitaciones:', error)
      alert('Error al enviar invitaciones')
    }
  }

  // Función para enviar mensaje por WhatsApp Web
  const handleEnviarPorWhatsAppWeb = (liderId: string) => {
    const lider = votantes.find(v => v.id === liderId)
    if (!lider || !lider.whatsapp) {
      alert('Líder no tiene número de WhatsApp')
      return
    }

    const evento = selectedEvento
    if (!evento) {
      alert('No hay evento seleccionado')
      return
    }

    // Construir enlace de inscripción
    const enlace = `${window.location.origin}/inscripcion?evento=${evento.id}&lider=${liderId}`
    
    // Mensaje personalizado
    const mensaje = `¡Hola ${lider.nombre}! Te invitamos a liderar en el evento "${evento.titulo}".\n\nDesde el siguiente enlace podrás inscribir a tus invitados:\n${enlace}`
    
    // Codificar para URL
    const mensajeCodificado = encodeURIComponent(mensaje)
    const numero = lider.whatsapp.startsWith('+') ? lider.whatsapp : '+' + lider.whatsapp
    
    // Abrir WhatsApp nativo (funciona en móvil y PC)
    const whatsappUrl = `https://wa.me/${numero.replace('+', '')}?text=${mensajeCodificado}`
    window.open(whatsappUrl, '_blank')
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-red-50">
      {/* Header Político Moderno */}
      <header className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Megaphone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CRM Politica Fredy Arenas</h1>
                <p className="text-blue-100 text-sm">Gestión de Campañas Estratégicas Appyempresa S.A.S</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Upload className="h-4 w-4 mr-2" />
                Importar Datos
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowCampanaForm(true)}>
                <Send className="h-4 w-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Moderno */}
        <aside className="w-64 bg-white shadow-xl min-h-screen border-r border-gray-100">
          <div className="p-4">
            <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 text-white">
              <h3 className="font-bold text-lg">Panel de Control</h3>
              <p className="text-sm opacity-90">Gestiona tu campaña</p>
            </div>
            
            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'votantes' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'votantes' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('votantes')}
              >
                <Users className="h-4 w-4 mr-3" />
                Votantes
              </Button>
              <Button 
                variant={activeTab === 'campanas' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'campanas' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('campanas')}
              >
                <Megaphone className="h-4 w-4 mr-3" />
                Campañas
              </Button>
              <Button 
                variant={activeTab === 'mensajeria' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'mensajeria' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('mensajeria')}
              >
                <Send className="h-4 w-4 mr-3" />
                Mensajería Masiva
              </Button>
              <Button 
                variant={activeTab === 'eventos' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'eventos' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('eventos')}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Eventos
              </Button>
              <Button 
                variant={activeTab === 'plantillas' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${
                  activeTab === 'plantillas' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => setActiveTab('plantillas')}
              >
                <Mail className="h-4 w-4 mr-3" />
                Plantillas
              </Button>

              <Button
              variant={activeTab === 'invitaciones' ? 'default' : 'ghost'}
              className={`w-full justify-start ${
              activeTab === 'invitaciones'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'hover:bg-blue-50 text-gray-700'
              }`}
              onClick={() => setActiveTab('invitaciones')}
              >
              <MessageSquare className="h-4 w-4 mr-3" />
              Invitaciones a Eventos
              </Button>

            </nav>
          </div>

          {/* Estadísticas Rápidas en Sidebar */}
          <div className="p-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Resumen Rápido</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Votantes Totales</span>
                <span className="font-bold text-blue-600">{votantes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Simpatizantes</span>
                <span className="font-bold text-green-600">
                  {votantes.filter(v => v.estado === 'simpatizante').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Voluntarios</span>
                <span className="font-bold text-purple-600">
                  {votantes.filter(v => v.estado === 'voluntario').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Líderes</span>
                <span className="font-bold text-blue-600">
                  {votantes.filter(v => v.estado === 'lider').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Coordinadores</span>
                <span className="font-bold text-indigo-600">
                  {votantes.filter(v => v.estado === 'coordinador').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Campañas Activas</span>
                <span className="font-bold text-orange-600">{campanasActivas.length}</span>
              </div>
            </div>
          </div>



          {/* Filtro por Municipio */}
          <div className="p-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Filtrar por Municipio</h4>
            <Select onValueChange={(value) => {
              // Aquí podrías implementar lógica de filtrado si lo deseas
              console.log('Filtrar por municipio:', value)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los municipios" />
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






        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard de Campaña</h2>
                <p className="text-gray-600">Resumen de tu estrategia política</p>
              </div>

              {/* Stats Grid con Colores Políticos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className={`${stat.color} p-2 rounded-lg`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <p className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} este mes
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Secciones y Actividad */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Barrios Activos
                    </CardTitle>
                    <CardDescription>Cobertura por barrio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {barriosActivos.length > 0 ? (
                        barriosActivos.map((barrio, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                                {barrio}
                              </div>
                              <span className="text-sm text-gray-700">
                                {votantes.filter(v => v.barrio === barrio).length} votantes
                              </span>
                            </div>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay barrios registrados aún
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      Votantes Recientes
                    </CardTitle>
                    <CardDescription>Últimos registros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {votantesRecientes.length > 0 ? (
                        votantesRecientes.map((votante) => (
                          <div key={votante.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{votante.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {votante.municipio} - Barrio {votante.barrio}
                              </p>
                            </div>
                            <div className="text-right">
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
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(votante.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay votantes registrados aún
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Campañas Activas y Eventos Próximos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Megaphone className="h-5 w-5 mr-2 text-orange-600" />
                      Campañas Activas
                    </CardTitle>
                    <CardDescription>Campañas en curso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {campanasActivas.length > 0 ? (
                        campanasActivas.map((campana) => (
                          <div key={campana.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{campana.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {campana.mensajesEnviados} mensajes enviados
                              </p>
                            </div>
                            <Badge className="bg-orange-100 text-orange-800">
                              Activa
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay campañas activas
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Eventos Próximos
                    </CardTitle>
                    <CardDescription>Próximas actividades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventosProximos.length > 0 ? (
                        eventosProximos.map((evento) => (
                          <div key={evento.id} className="border border-purple-100 rounded-lg p-3 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{evento.titulo}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(evento.fecha).toLocaleDateString()} - {evento.ubicacion}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  📋 Total inscritos: {evento.totalInscritos}
                                </p>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800">
                                {evento.tipo}
                              </Badge>
                            </div>

                           {/* Selector de líderes */}
                            {evento.lideres?.length > 0 && (
                            <div className="mt-3">
                            <Label className="text-xs text-gray-700">Líderes con invitaciones</Label>
                            <Select
                            onValueChange={(selectedLiderId) => {
                            const container = document.getElementById(`inscritos-${evento.id}`);
                            if (container) {
                            container.innerHTML = '';
                            // Verificar que inscripciones no sea null
                            const inscripciones = evento.inscripciones ?? [];
                            const inscritosFiltrados = inscripciones.filter(i => i.liderId === selectedLiderId);
                            if (inscritosFiltrados.length > 0) {
                            inscritosFiltrados.forEach(insc => {
                            const div = document.createElement('div');
                            div.className = 'flex justify-between text-xs py-1 border-b border-gray-100';
                            div.innerHTML = `
                            <span>${insc.nombre}</span>
                            <span class="text-gray-500">${insc.cedula}</span>
                            `;
                            container.appendChild(div);
                            });
                            } else {
                            container.innerHTML = '<p class="text-xs text-gray-500 py-2">No hay inscritos</p>';
                            }
                            }
                            }}
                            >
                            <SelectTrigger className="w-full text-xs">
                            <SelectValue placeholder="Seleccione un líder" />
                            </SelectTrigger>
                            <SelectContent>
                            {evento.lideres?.map(lider => (
                            <SelectItem key={lider.id} value={lider.id} className="text-xs">
                            {lider.nombre}
                            </SelectItem>
                            ))}
                            </SelectContent>
                            </Select>
                            <div id={`inscritos-${evento.id}`} className="mt-2 max-h-40 overflow-y-auto">
                            <p className="text-xs text-gray-500 py-2">Seleccione un líder para ver sus invitados</p>
                            </div>
                            </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No hay eventos programados
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Métricas de Campaña */}
              <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Resumen de Campaña</CardTitle>
                  <CardDescription className="text-blue-700">
                    Métricas clave de tu estrategia política
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Tasa de conversión de indecisos */}
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{tasaConversionIndecisos}%</div>
                      <p className="text-sm text-gray-600">Indecisos → Simpatizantes (esta semana)</p>
                    </div>

                    {/* Votantes listos para movilizar */}
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{porcentajeListos}%</div>
                      <p className="text-sm text-gray-600">Listos para Movilizar</p>
                    </div>

                    {/* Total inscritos */}
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{totalInscritos}</div>
                      <p className="text-sm text-gray-600">Inscritos a Reuniones</p>
                    </div>

                    {/* Top 5 líderes */}
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{totalLideresActivos}</div>
                      <p className="text-sm text-gray-600">Líderes Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Líderes Detalle */}
              {lideresArray.length > 0 && (
                <Card className="mt-4 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-900">🏆 Top 5 Líderes con Más Confirmaciones</CardTitle>
                    <CardDescription className="text-purple-700">
                      Líderes que han traído más simpatizantes a reuniones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lideresArray.map((lider, index) => (
                        <div key={lider.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{lider.nombre}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-700">{lider.count} inscritos</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'votantes' && (
            <VotantesManager votantes={votantes} onVotanteChange={fetchVotantes} />
          )}

          {activeTab === 'campanas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Gestión de Campañas</h2>
                  <p className="text-gray-600">Administra tus campañas políticas</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCampanaForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Campaña
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campanas.map((campana) => (
                  <Card key={campana.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campana.nombre}</CardTitle>
                          <CardDescription>{campana.descripcion}</CardDescription>
                        </div>
                        <Badge 
                          className={
                            campana.estado === 'activa' ? 'bg-green-100 text-green-800' :
                            campana.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {campana.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Objetivo:</span>
                          <span className="font-medium">{campana.objetivo}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mensajes:</span>
                          <span className="font-medium">{campana.mensajesEnviados}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Periodo:</span>
                          <span className="font-medium">
                            {new Date(campana.fechaInicio).toLocaleDateString()} - {new Date(campana.fechaFin).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingCampana(campana)
                              setShowCampanaForm(true)
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteCampana(campana.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {campanas.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay campañas</h3>
                    <p className="text-gray-500 mb-4">Crea tu primera campaña para comenzar</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowCampanaForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Campaña
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'mensajeria' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Mensajería Masiva</h2>
                <p className="text-gray-600">Envía mensajes personalizados a tus votantes</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel de selección de votantes */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Filtrar y Seleccionar Votantes</CardTitle>
                    <CardDescription>Elige a quiénes enviar el mensaje</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Filtros */}
                    {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('todos')}
            >
              Todos
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'potencial' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('potencial')}
            >
              Potenciales
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'simpatizante' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('simpatizante')}
            >
              Simpatizantes
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'voluntario' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('voluntario')}
            >
              Voluntarios
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'indeciso' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('indeciso')}
            >
              Indecisos
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'lider' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('lider')}
            >
              Líderes
            </Button>
            <Button
              size="sm"
              variant={filtroEstadoMensajeria === 'coordinador' ? 'default' : 'outline'}
              onClick={() => setFiltroEstadoMensajeria('coordinador')}
            >
              Coordinadores
            </Button>
          </div>

                    {/* Búsqueda por cédula/nombre */}
                    <Input
                      placeholder="Buscar por cédula o nombre..."
                      value={busquedaMensajeria}
                      onChange={(e) => setBusquedaMensajeria(e.target.value)}
                    />

                    {/* Lista de votantes */}
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                      {votantesFiltradosMensajeria.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {votantesFiltradosMensajeria.map((votante) => (
                            <div key={votante.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={votantesSeleccionados.has(votante.id)}
                                onChange={(e) => {
                                  const newSet = new Set(votantesSeleccionados)
                                  if (e.target.checked) {
                                    newSet.add(votante.id)
                                  } else {
                                    newSet.delete(votante.id)
                                  }
                                  setVotantesSeleccionados(newSet)
                                }}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{votante.nombre}</p>
                                <p className="text-sm text-gray-600">{votante.cedula}</p>
                              </div>
                              <Badge
                                variant={
                                  votante.estado === 'simpatizante' ? 'default' :
                                  votante.estado === 'voluntario' ? 'secondary' :
                                  votante.estado === 'lider' || votante.estado === 'coordinador' ? 'secondary' :
                                  'outline'
                                }
                                className={
                                  votante.estado === 'simpatizante' ? 'bg-green-100 text-green-800' :
                                  votante.estado === 'voluntario' ? 'bg-purple-100 text-purple-800' :
                                  votante.estado === 'lider' ? 'bg-blue-100 text-blue-800' :
                                  votante.estado === 'coordinador' ? 'bg-indigo-100 text-indigo-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {votante.estado === 'lider' ? 'Líder' : 
                                votante.estado === 'coordinador' ? 'Coordinador' : 
                                votante.estado}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No hay votantes que coincidan</p>
                      )}
                    </div>

                    {/* Acciones de selección */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const ids = new Set(votantesFiltradosMensajeria.map(v => v.id))
                          setVotantesSeleccionados(ids)
                        }}
                      >
                        Seleccionar Todos ({votantesFiltradosMensajeria.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVotantesSeleccionados(new Set())}
                      >
                        Limpiar Selección
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Panel de composición de mensaje */}
                <Card>
                  <CardHeader>
                    <CardTitle>Componer Mensaje</CardTitle>
                    <CardDescription>Personaliza tu mensaje masivo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Plataforma */}
                    <div>
                      <Label>Plataforma</Label>
                      <Select value={plataformaMensajeria} onValueChange={setPlataformaMensajeria}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Asunto (solo para email) */}
                    {plataformaMensajeria === 'email' && (
                      <div>
                        <Label>Asunto</Label>
                        <Input
                          value={asuntoMensajeria}
                          onChange={(e) => setAsuntoMensajeria(e.target.value)}
                          placeholder="Asunto del correo"
                        />
                      </div>
                    )}

                    {/* Contenido del mensaje */}
                    <div>
                      <Label>Mensaje</Label>
                      <Textarea
                        value={mensajeMensajeria}
                        onChange={(e) => setMensajeMensajeria(e.target.value)}
                        placeholder="Escribe tu mensaje. Usa variables como {nombre}, {cedula}, {whatsapp}, etc."
                        rows={8}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Variables disponibles: {'{nombre}'}, {'{cedula}'}, {'{whatsapp}'}, {'{email}'}, {'{telefono}'}, {'{municipio}'}, {'{barrio}'}
                      </div>
                    </div>

                    {/* Vista previa */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label>Vista Previa</Label>
                      <div className="mt-2 text-sm bg-white p-2 rounded border">
                        {mensajeMensajeria.replace(/\{nombre\}/g, '[Nombre]') || 'Escribe un mensaje...'}
                      </div>
                    </div>

                    {/* Botón de envío */}
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleEnviarMensajes}
                      disabled={votantesSeleccionados.size === 0 || !mensajeMensajeria.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar a {votantesSeleccionados.size} votantes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h2>
                  <p className="text-gray-600">Organiza eventos políticos</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEventoForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => (
                  <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                          <CardDescription>{evento.descripcion}</CardDescription>
                        </div>
                        <Badge 
                          className={
                            evento.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                            evento.estado === 'en_curso' ? 'bg-green-100 text-green-800' :
                            evento.estado === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {evento.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fecha:</span>
                          <span className="font-medium">{new Date(evento.fecha).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hora:</span>
                          <span className="font-medium">{evento.hora}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ubicación:</span>
                          <span className="font-medium">{evento.ubicacion}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Asistentes:</span>
                          <span className="font-medium">{evento.asistentes?.length || 0}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingEvento(evento)
                              setShowEventoForm(true)
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteEvento(evento.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {eventos.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
                    <p className="text-gray-500 mb-4">Crea tu primer evento</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEventoForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evento
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'plantillas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Plantillas de Mensaje</h2>
                  <p className="text-gray-600">Gestiona plantillas para comunicación</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowPlantillaForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plantillas.map((plantilla) => (
                  <Card key={plantilla.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plantilla.nombre}</CardTitle>
                          <CardDescription>{plantilla.contenido.substring(0, 50)}...</CardDescription>
                        </div>
                        <Badge 
                          className={
                            plantilla.tipo === 'whatsapp' ? 'bg-green-100 text-green-800' :
                            plantilla.tipo === 'email' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }
                        >
                          {plantilla.tipo}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {plantilla.asunto && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Asunto:</span>
                            <span className="font-medium">{plantilla.asunto}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Variables:</span>
                          <span className="font-medium">{plantilla.variables.join(', ')}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingPlantilla(plantilla)
                              setShowPlantillaForm(true)
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePlantilla(plantilla.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {plantillas.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
                    <p className="text-gray-500 mb-4">Crea plantillas para agilizar tu comunicación</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowPlantillaForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Plantilla
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}


          {activeTab === 'invitaciones' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Campañas de Invitación</h2>
              <p className="text-gray-600">Envía enlaces personalizados a líderes para que inviten a sus contactos</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Crear Campaña de Invitación</CardTitle>
                <CardDescription>Selecciona un evento y los líderes a los que deseas enviar el enlace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector de evento */}
                <div>
                  <Label>Evento Activo</Label>
                  <Select
                    onValueChange={(value) => {
                      const evento = eventos.find(e => e.id === value)
                      setSelectedEvento(evento || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventos
                        .filter(e => e.estado === 'programado')
                        .map(evento => (
                          <SelectItem key={evento.id} value={evento.id}>
                            {evento.titulo} - {new Date(evento.fecha).toLocaleDateString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtros y lista de líderes */}
                {selectedEvento && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={filtroEstadoLideres === 'todos' ? 'default' : 'outline'}
                        onClick={() => setFiltroEstadoLideres('todos')}
                      >
                        Todos
                      </Button>
                      <Button
                        size="sm"
                        variant={filtroEstadoLideres === 'potencial' ? 'default' : 'outline'}
                        onClick={() => setFiltroEstadoLideres('potencial')}
                      >
                        Potenciales
                      </Button>
                      <Button
                        size="sm"
                        variant={filtroEstadoLideres === 'lider' ? 'default' : 'outline'}
                        onClick={() => setFiltroEstadoLideres('lider')}
                      >
                        Líderes
                      </Button>
                      <Button
                        size="sm"
                        variant={filtroEstadoLideres === 'coordinador' ? 'default' : 'outline'}
                        onClick={() => setFiltroEstadoLideres('coordinador')}
                      >
                        Coordinadores
                      </Button>
                    </div>

                   <Input
                    placeholder="Buscar líder por nombre o cédula..."
                    value={busquedaLideres}
                    onChange={(e) => setBusquedaLideres(e.target.value)}
                    />

                    {/* Filtro por municipio */}
                    <div className="w-full sm:w-48 mt-2">
                    <Label htmlFor="filtroMunicipioLideres" className="text-sm text-gray-600">Filtrar por municipio</Label>
                    <Select value={filtroMunicipioLideres} onValueChange={setFiltroMunicipioLideres}>
                    <SelectTrigger id="filtroMunicipioLideres" className="mt-1">
                    <SelectValue placeholder="Todos los municipios" />
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
                    <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>
                    ))}
                    </SelectContent>
                    </Select>
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {lideresFiltrados.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {lideresFiltrados.map(lider => (
                          <div key={lider.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="flex-1">
                                <p className="font-medium">{lider.nombre}</p>
                                <p className="text-sm text-gray-600">{lider.cedula}</p>
                                <p className="text-xs text-gray-500">
                                  {lider.whatsapp || 'Sin WhatsApp'}
                                </p>
                              </div>
                             <Badge variant="outline">
                              {lider.estado === 'lider' ? 'Líder' : 
                              lider.estado === 'coordinador' ? 'Coordinador' : 
                              lider.estado.charAt(0).toUpperCase() + lider.estado.slice(1)}
                            </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnviarPorWhatsAppWeb(lider.id)}
                              disabled={!lider.whatsapp}
                              className="ml-2"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Enviar
                            </Button>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No hay líderes que coincidan</p>
                      )}
                    </div>
  
                    {/* Botón para enviar a todos (opcional) */}
                    {selectedEvento && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (lideresFiltrados.length === 0) {
                            alert('No hay líderes para enviar')
                            return
                          }
                          if (!confirm(`¿Abrir WhatsApp Web para ${lideresFiltrados.length} líderes? Esto abrirá ${lideresFiltrados.length} pestañas.`)) {
                            return
                          }
                          lideresFiltrados.forEach(lider => {
                            if (lider.whatsapp) {
                              handleEnviarPorWhatsAppWeb(lider.id)
                            }
                          })
                        }}
                        disabled={lideresFiltrados.length === 0}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a todos los {lideresFiltrados.length} líderes
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}





        </main>
      </div>

      {/* Modal para Campañas */}
      <Dialog open={showCampanaForm} onOpenChange={setShowCampanaForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampana ? 'Editar Campaña' : 'Nueva Campaña'}</DialogTitle>
            <DialogDescription>
              {editingCampana ? 'Edita los detalles de la campaña' : 'Crea una nueva campaña política'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Campaña</Label>
                <Input id="nombre" defaultValue={editingCampana?.nombre} />
              </div>
              <div>
                <Label htmlFor="objetivo">Objetivo</Label>
                <Input id="objetivo" defaultValue={editingCampana?.objetivo} />
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" defaultValue={editingCampana?.descripcion} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input id="fechaInicio" type="date" defaultValue={editingCampana?.fechaInicio?.split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input id="fechaFin" type="date" defaultValue={editingCampana?.fechaFin?.split('T')[0]} />
              </div>
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select defaultValue={editingCampana?.estado || 'activa'}>
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCampanaForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={async () => {
                const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value
                const objetivo = (document.getElementById('objetivo') as HTMLInputElement)?.value
                const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement)?.value
                const fechaInicio = (document.getElementById('fechaInicio') as HTMLInputElement)?.value
                const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement)?.value
                const estadoValue = (document.getElementById('estado') as HTMLSelectElement)?.value || 'activa'
                
                // ✅ Conversión segura al literal type
                const estado = estadoValue as 'activa' | 'pausada' | 'finalizada'

                const data = {
                  nombre,
                  objetivo: objetivo || '',
                  descripcion: descripcion || '',
                  fechaInicio,
                  fechaFin,
                  estado,
                  mensajesEnviados: 0
                }
                await handleSaveCampana(data)
              }}>
                <Save className="h-4 w-4 mr-2" />
                {editingCampana ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Eventos */}
      <Dialog open={showEventoForm} onOpenChange={setShowEventoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvento ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
            <DialogDescription>
              {editingEvento ? 'Edita los detalles del evento' : 'Crea un nuevo evento político'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título del Evento</Label>
                <Input id="titulo" defaultValue={editingEvento?.titulo} />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Evento</Label>
                <Select defaultValue={editingEvento?.tipo || 'reunion'}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reunion">Reunión</SelectItem>
                    <SelectItem value="concentracion">Concentración</SelectItem>
                    <SelectItem value="debate">Debate</SelectItem>
                    <SelectItem value="visita">Visita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" defaultValue={editingEvento?.descripcion} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" type="date" defaultValue={editingEvento?.fecha?.split('T')[0]} />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input id="hora" type="time" defaultValue={editingEvento?.hora} />
              </div>
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" defaultValue={editingEvento?.ubicacion} />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select defaultValue={editingEvento?.estado || 'programado'}>
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="en_curso">En Curso</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>



            {/* Selector de líder para enlace de inscripción */}
            <div>
              <Label htmlFor="lider">Líder o Coordinador</Label>
              <Select
                defaultValue={editingEvento?.liderId || ''}
                onValueChange={(value) => {
                  const input = document.getElementById('liderId') as HTMLInputElement;
                  if (input) input.value = value;
                }}
              >
                <SelectTrigger id="lider">
                  <SelectValue placeholder="Seleccione un líder o coordinador" />
                </SelectTrigger>
                <SelectContent>
                  {votantes
                    .filter(v => ['lider', 'coordinador'].includes(v.estado))
                    .map(lider => (
                      <SelectItem key={lider.id} value={lider.id}>
                        {lider.nombre} ({lider.cedula}) - {lider.estado === 'lider' ? 'Líder' : 'Coordinador'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <input type="hidden" id="liderId" defaultValue={editingEvento?.liderId || ''} />
            </div>


            

            {/* Botones de enlace de inscripción */}
            {editingEvento?.id && (
              <div className="pt-4">
                <Label>Enlace de inscripción</Label>
                <div className="flex space-x-2 pt-2">
                  <Input 
                    id="enlaceInscripcion" 
                    readOnly 
                    placeholder="Guarde el evento y seleccione un líder para generar el enlace"
                  />
                  <Button 
                    type="button"
                    onClick={() => {
                      const eventoId = editingEvento.id;
                      const liderId = (document.getElementById('liderId') as HTMLInputElement)?.value;
                      if (!eventoId || !liderId) {
                        alert('Debe seleccionar un líder primero');
                        return;
                      }
                      const url = `${window.location.origin}/inscripcion?evento=${eventoId}&lider=${liderId}`;
                      const input = document.getElementById('enlaceInscripcion') as HTMLInputElement;
                      input.value = url;
                      navigator.clipboard.writeText(url);
                      alert('Enlace copiado al portapapeles');
                    }}
                  >
                    Generar Enlace
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const enlace = (document.getElementById('enlaceInscripcion') as HTMLInputElement)?.value;
                      if (!enlace) {
                        alert('Genere el enlace primero');
                        return;
                      }
                      
                      const liderId = (document.getElementById('liderId') as HTMLInputElement)?.value;
                      const lider = votantes.find(v => v.id === liderId);
                      if (!lider?.whatsapp) {
                        alert('El líder no tiene número de WhatsApp registrado');
                        return;
                      }
                      
                      const telefono = lider.whatsapp.replace(/\D/g, '');
                      const mensaje = encodeURIComponent(
                        `Hola ${lider.nombre},\n\nTe comparto el enlace para que invites a tus simpatizantes a la reunión:\n\n${enlace}`
                      );
                      
                      window.open(`https://web.whatsapp.com/send?phone=${telefono}&text=${mensaje}`, '_blank');
                    }}
                  >
                    Enviar por WhatsApp
                  </Button>
                </div>
              </div>
            )}



            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEventoForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={async () => {
                const titulo = (document.getElementById('titulo') as HTMLInputElement)?.value
                const tipoValue = (document.getElementById('tipo') as HTMLSelectElement)?.value || 'reunion'
                const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement)?.value
                const fechaInput = (document.getElementById('fecha') as HTMLInputElement)?.value
                const fecha = fechaInput ? new Date(fechaInput + 'T12:00:00').toISOString().split('T')[0] : ''
                const hora = (document.getElementById('hora') as HTMLInputElement)?.value
                const ubicacion = (document.getElementById('ubicacion') as HTMLInputElement)?.value
                const estadoValue = (document.getElementById('estado') as HTMLSelectElement)?.value || 'programado'
                const liderId = (document.getElementById('liderId') as HTMLInputElement)?.value || null
                // Conversión segura a tipos literales
                const tipo = tipoValue as 'reunion' | 'concentracion' | 'debate' | 'visita'
                const estado = estadoValue as 'programado' | 'en_curso' | 'finalizado' | 'cancelado'
                const data = {
                  titulo,
                  tipo,
                  descripcion: descripcion || '',
                  fecha,
                  hora,
                  ubicacion: ubicacion || '',
                  estado,
                  asistentes: [],
                  ...(liderId && { liderId }) // Solo incluir si existe
                }
                await handleSaveEvento(data)
              }}>
                <Save className="h-4 w-4 mr-2" />
                {editingEvento ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

     {/* Modal para Plantillas */}
      <Dialog open={showPlantillaForm} onOpenChange={setShowPlantillaForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}</DialogTitle>
            <DialogDescription>
              {editingPlantilla ? 'Edita los detalles de la plantilla' : 'Crea una nueva plantilla de mensaje'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Plantilla</Label>
                <Input id="nombre" defaultValue={editingPlantilla?.nombre} />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Mensaje</Label>
                <Select defaultValue={editingPlantilla?.tipo || 'whatsapp'}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="asunto">Asunto (solo para Email)</Label>
              <Input id="asunto" defaultValue={editingPlantilla?.asunto} />
            </div>
            <div>
              <Label htmlFor="contenido">Contenido del Mensaje</Label>
              <Textarea id="contenido" defaultValue={editingPlantilla?.contenido} rows={6} />
              <p className="text-sm text-gray-500 mt-1">
                Usa variables como {'{nombre}'}, {'{email}'}, {'{telefono}'} para personalizar
              </p>
            </div>
            <div>
              <Label htmlFor="variables">Variables (separadas por comas)</Label>
              <Input id="variables" defaultValue={editingPlantilla?.variables?.join(', ')} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPlantillaForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={async () => {
                const nombre = (document.getElementById('nombre') as HTMLInputElement)?.value
                const tipoValue = (document.getElementById('tipo') as HTMLSelectElement)?.value || 'whatsapp'
                const asunto = (document.getElementById('asunto') as HTMLInputElement)?.value
                const contenido = (document.getElementById('contenido') as HTMLTextAreaElement)?.value
                const variablesInput = (document.getElementById('variables') as HTMLInputElement)?.value || ''

                // Conversión segura a tipo literal
                const tipo = tipoValue as 'whatsapp' | 'email' | 'sms'

                // Parsear variables
                const variables = variablesInput
                  .split(',')
                  .map(v => v.trim())
                  .filter(v => v.length > 0)

                const data = {
                  nombre,
                  tipo,
                  asunto: asunto || undefined,
                  contenido: contenido || '',
                  variables
                }
                await handleSavePlantilla(data)
              }}>
                <Save className="h-4 w-4 mr-2" />
                {editingPlantilla ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
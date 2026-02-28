import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get('evento')
    const liderId = searchParams.get('lider')

    if (!eventoId || !liderId) {
      return NextResponse.json(
        { error: 'Faltan parámetros: evento y lider' },
        { status: 400 }
      )
    }

    // Obtener el evento
    const evento = await db.evento.findUnique({
      where: { id: eventoId },
      select: {
        id: true,
        titulo: true,
        fecha: true,
        hora: true,
        ubicacion: true
      }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el líder (debe ser un votante con rol válido: potencial, lider o coordinador)
    const lider = await db.votante.findUnique({
      where: { id: liderId },
      select: {
        id: true,
        nombre: true,
        estado: true
      }
    })

    const rolesValidos = ['potencial', 'lider', 'coordinador']
    if (!lider || !rolesValidos.includes(lider.estado)) {
      return NextResponse.json(
        { error: 'Líder no válido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      evento,
      lider
    })
  } catch (error) {
    console.error('Error al obtener datos de inscripción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
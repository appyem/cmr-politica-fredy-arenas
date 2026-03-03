import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const eventos = await db.evento.findMany({
      orderBy: { fecha: 'desc' }
    })

    const eventosConDatos = await Promise.all(
      eventos.map(async (evento) => {
        // Obtener todas las inscripciones del evento
        const inscripciones = await db.inscripcion.findMany({
          where: { eventoId: evento.id },
          select: {
            id: true,
            nombre: true,
            cedula: true,
            telefono: true,
            createdAt: true,
            liderId: true
          }
        })

        // Obtener IDs únicos de líderes
        const liderIds: string[] = []
        const seen = new Map<string, boolean>()
        for (const insc of inscripciones) {
          if (insc.liderId && !seen.has(insc.liderId)) {
            seen.set(insc.liderId, true)
            liderIds.push(insc.liderId)
          }
        }

        // Obtener datos de los líderes
        const lideres = await db.votante.findMany({
          where: { id: { in: liderIds } },
          select: {
            id: true,
            nombre: true
          }
        })

        return {
          ...evento,
          lideres: lideres || [],
          inscripciones: inscripciones || [],
          totalInscritos: inscripciones.length
        }
      })
    )

    return NextResponse.json(eventosConDatos)
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.titulo || !body.fecha || !body.hora || !body.ubicacion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const evento = await db.evento.create({
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion || '',
        fecha: new Date(body.fecha),
        hora: body.hora,
        ubicacion: body.ubicacion,
        tipo: body.tipo || 'reunion',
        estado: body.estado || 'programado',
        asistentes: null,
        ...(body.liderId && { liderId: body.liderId })
      }
    })

    return NextResponse.json(evento, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear evento:', error)
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 })
  }
}
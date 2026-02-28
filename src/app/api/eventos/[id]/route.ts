// src/app/api/eventos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    // Convertir asistentes a JSON string
    const asistentesString = body.asistentes ? JSON.stringify(body.asistentes) : null

    const evento = await db.evento.update({
      where: { id },
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion,
        fecha: body.fecha 
        ? new Date(new Date(body.fecha).setUTCHours(12, 0, 0, 0)) 
        : undefined,
        hora: body.hora,
        ubicacion: body.ubicacion,
        tipo: body.tipo,
        estado: body.estado,
        asistentes: asistentesString
      }
    })

    // Convertir de vuelta a objeto para la respuesta
    const eventoResponse = {
      ...evento,
      asistentes: evento.asistentes ? JSON.parse(evento.asistentes) : []
    }

    return NextResponse.json(eventoResponse)
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await db.evento.delete({ where: { id } })
    return NextResponse.json({ message: 'Evento eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 })
  }
}
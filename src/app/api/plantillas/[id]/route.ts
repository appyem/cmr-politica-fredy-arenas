// src/app/api/plantillas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const variables = Array.isArray(body.variables)
      ? body.variables
      : (typeof body.variables === 'string' ? body.variables.split(',').map(v => v.trim()) : [])

    const plantilla = await db.plantilla.update({
      where: { id },
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        asunto: body.asunto,
        contenido: body.contenido,
        variables
      }
    })

    return NextResponse.json(plantilla)
  } catch (error) {
    console.error('Error al actualizar plantilla:', error)
    return NextResponse.json({ error: 'Error al actualizar plantilla' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await db.plantilla.delete({ where: { id } })
    return NextResponse.json({ message: 'Plantilla eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar plantilla:', error)
    return NextResponse.json({ error: 'Error al eliminar plantilla' }, { status: 500 })
  }
}
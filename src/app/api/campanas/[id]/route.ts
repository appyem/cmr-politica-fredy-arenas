// src/app/api/campanas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const campana = await db.campana.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : undefined,
        estado: body.estado,
        objetivo: body.objetivo,
        mensajesEnviados: body.mensajesEnviados
      }
    })

    return NextResponse.json(campana)
  } catch (error) {
    console.error('Error al actualizar campaña:', error)
    return NextResponse.json({ error: 'Error al actualizar campaña' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await db.campana.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Campaña eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar campaña:', error)
    return NextResponse.json({ error: 'Error al eliminar campaña' }, { status: 500 })
  }
}
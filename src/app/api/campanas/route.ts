// src/app/api/campanas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const campanas = await db.campana.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(campanas)
  } catch (error) {
    console.error('Error al obtener campañas:', error)
    return NextResponse.json({ error: 'Error al obtener campañas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar campos obligatorios
    if (!body.nombre || !body.fechaInicio || !body.fechaFin) {
      return NextResponse.json(
        { error: 'Los campos nombre, fechaInicio y fechaFin son obligatorios' },
        { status: 400 }
      )
    }

    const campana = await db.campana.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || '',
        fechaInicio: new Date(body.fechaInicio),
        fechaFin: new Date(body.fechaFin),
        estado: body.estado || 'activa',
        objetivo: body.objetivo || '',
        mensajesEnviados: body.mensajesEnviados || 0
      }
    })

    return NextResponse.json(campana, { status: 201 })
  } catch (error) {
    console.error('Error al crear campaña:', error)
    return NextResponse.json({ error: 'Error al crear campaña' }, { status: 500 })
  }
}
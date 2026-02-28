// src/app/api/plantillas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const plantillas = await db.plantilla.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(plantillas)
  } catch (error) {
    console.error('Error al obtener plantillas:', error)
    return NextResponse.json({ error: 'Error al obtener plantillas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nombre || !body.tipo || !body.contenido) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: nombre, tipo y contenido' }, { status: 400 })
    }

    const variables = Array.isArray(body.variables)
      ? body.variables
      : (typeof body.variables === 'string' ? body.variables.split(',').map(v => v.trim()) : [])

    const plantilla = await db.plantilla.create({
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        asunto: body.asunto || undefined,
        contenido: body.contenido,
        variables
      }
    })

    return NextResponse.json(plantilla, { status: 201 })
  } catch (error) {
    console.error('Error al crear plantilla:', error)
    return NextResponse.json({ error: 'Error al crear plantilla' }, { status: 500 })
  }
}
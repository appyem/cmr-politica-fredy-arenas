// src/app/api/sms/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      votanteId, 
      mensaje, 
      tipo = 'individual'
    } = body

    if (!votanteId || !mensaje) {
      return NextResponse.json(
        { error: 'ID del votante y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Obtener votante
    const votante = await db.votante.findUnique({
      where: { id: votanteId }
    })

    if (!votante) {
      return NextResponse.json(
        { error: 'Votante no encontrado' },
        { status: 404 }
      )
    }

    if (!votante.telefono) {
      return NextResponse.json(
        { error: 'El votante no tiene número de teléfono configurado' },
        { status: 400 }
      )
    }

    // Crear registro del mensaje
    const mensajeDB = await db.mensaje.create({
      data: {
        votanteId,
        plataforma: 'sms',
        tipo,
        contenido: mensaje,
        estado: 'enviado',
        fechaEnvio: new Date()
      }
    })

    // Aquí iría la integración real con servicios de SMS
    // Por ahora, solo guardamos en la base de datos
    console.log(`SMS guardado para ${votante.nombre}:`, {
      numero: votante.telefono,
      mensaje
    })

    return NextResponse.json({
      success: true,
      message: 'SMS guardado exitosamente',
      mensajeId: mensajeDB.id,
      numero: votante.telefono
    })

  } catch (error) {
    console.error('Error en SMS:', error)
    return NextResponse.json(
      { error: 'Error al procesar SMS' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const mensajesSMS = await db.mensaje.findMany({
      where: {
        plataforma: 'sms'
      },
      include: {
        votante: {
          select: {
            nombre: true,
            telefono: true
          }
        }
      },
      orderBy: {
        fechaEnvio: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      mensajes: mensajesSMS
    })

  } catch (error) {
    console.error('Error obteniendo mensajes SMS:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes SMS' },
      { status: 500 }
    )
  }
}
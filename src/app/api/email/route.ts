// src/app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      votanteId, 
      asunto,
      mensaje, 
      tipo = 'individual'
    } = body

    if (!votanteId || !mensaje || !asunto) {
      return NextResponse.json(
        { error: 'ID del votante, asunto y mensaje son requeridos' },
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

    if (!votante.email) {
      return NextResponse.json(
        { error: 'El votante no tiene email configurado' },
        { status: 400 }
      )
    }

    // Crear registro del mensaje
    const mensajeDB = await db.mensaje.create({
      data: {
        votanteId,
        plataforma: 'email',
        tipo,
        asunto,
        contenido: mensaje,
        estado: 'enviado',
        fechaEnvio: new Date()
      }
    })

    // Aquí iría la integración real con servicios de email
    // Por ahora, solo guardamos en la base de datos
    console.log(`Email guardado para ${votante.nombre}:`, {
      email: votante.email,
      asunto,
      mensaje
    })

    return NextResponse.json({
      success: true,
      message: 'Email guardado exitosamente',
      mensajeId: mensajeDB.id,
      email: votante.email
    })

  } catch (error) {
    console.error('Error en email:', error)
    return NextResponse.json(
      { error: 'Error al procesar email' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const mensajesEmail = await db.mensaje.findMany({
      where: {
        plataforma: 'email'
      },
      include: {
        votante: {
          select: {
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        fechaEnvio: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      mensajes: mensajesEmail
    })

  } catch (error) {
    console.error('Error obteniendo mensajes de email:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes de email' },
      { status: 500 }
    )
  }
}
// src/app/api/whatsapp/route.ts
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

    // Determinar número de WhatsApp
    const whatsappNumber = votante.whatsapp || votante.telefono

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'El votante no tiene número de WhatsApp configurado' },
        { status: 400 }
      )
    }

    // Crear registro del mensaje
    const mensajeDB = await db.mensaje.create({
      data: {
        votanteId,
        plataforma: 'whatsapp',
        tipo,
        contenido: mensaje,
        estado: 'enviado',
        fechaEnvio: new Date()
      }
    })

    // Aquí iría la integración real con WhatsApp Business API
    // Por ahora, solo guardamos en la base de datos
    console.log(`Mensaje de WhatsApp guardado para ${votante.nombre}:`, {
      numero: whatsappNumber,
      mensaje
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje de WhatsApp guardado exitosamente',
      mensajeId: mensajeDB.id,
      numero: whatsappNumber
    })

  } catch (error) {
    console.error('Error en WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al procesar mensaje de WhatsApp' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const mensajesWhatsApp = await db.mensaje.findMany({
      where: {
        plataforma: 'whatsapp'
      },
      include: {
        votante: {
          select: {
            nombre: true,
            whatsapp: true
          }
        }
      },
      orderBy: {
        fechaEnvio: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      mensajes: mensajesWhatsApp
    })

  } catch (error) {
    console.error('Error obteniendo mensajes de WhatsApp:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes de WhatsApp' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const conversaciones = await db.conversacion.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true,
            telefono: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    })
    
    return NextResponse.json(conversaciones)
  } catch (error) {
    console.error('Error fetching conversaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener conversaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clienteId, mensaje, tipo = 'enviado', plataforma = 'whatsapp' } = body

    if (!clienteId || !mensaje) {
      return NextResponse.json(
        { error: 'ID del cliente y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const cliente = await db.cliente.findUnique({
      where: { id: clienteId }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    const nuevaConversacion = await db.conversacion.create({
      data: {
        clienteId,
        mensaje,
        tipo,
        plataforma
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true,
            telefono: true
          }
        }
      }
    })

    // Aquí iría la integración real con WhatsApp Business API
    // Por ahora, solo guardamos en la base de datos
    console.log('Mensaje de WhatsApp simulado:', {
      to: cliente.telefono,
      message: mensaje
    })

    return NextResponse.json(nuevaConversacion, { status: 201 })
  } catch (error) {
    console.error('Error creating conversacion:', error)
    return NextResponse.json(
      { error: 'Error al crear conversación' },
      { status: 500 }
    )
  }
}
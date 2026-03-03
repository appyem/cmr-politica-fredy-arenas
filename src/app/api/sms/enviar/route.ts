import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefono, mensaje, votantesSeleccionados } = body

    if (!telefono && !votantesSeleccionados) {
      return NextResponse.json(
        { error: 'Teléfono o votantes seleccionados son requeridos' },
        { status: 400 }
      )
    }

    if (!mensaje) {
      return NextResponse.json(
        { error: 'El mensaje es requerido' },
        { status: 400 }
      )
    }

    // Validar que el número tenga formato colombiano
    const validarNumeroColombia = (numero: string) => {
      const limpio = numero.replace(/\D/g, '')
      if (limpio.startsWith('57')) {
        return `+${limpio}`
      }
      if (limpio.startsWith('3') && limpio.length === 10) {
        return `+57${limpio}`
      }
      return null
    }

    // Envío individual
    if (telefono) {
      const numeroValido = validarNumeroColombia(telefono)
      if (!numeroValido) {
        return NextResponse.json(
          { error: 'Número de teléfono inválido. Formato: 3001234567' },
          { status: 400 }
        )
      }

      const message = await client.messages.create({
        body: mensaje,
        from: twilioPhone,
        to: numeroValido
      })

      return NextResponse.json({
        success: true,
        message: 'SMS enviado exitosamente',
        messageId: message.sid,
        telefono: numeroValido
      })
    }

    // Envío masivo
    if (votantesSeleccionados) {
      const resultados = []
      const errores = []

      for (const votante of votantesSeleccionados) {
        try {
          const numeroValido = validarNumeroColombia(votante.whatsapp || votante.telefono)
          if (!numeroValido) {
            errores.push({ votante: votante.nombre, error: 'Número inválido' })
            continue
          }

          const mensajePersonalizado = mensaje.replace(/{nombre}/g, votante.nombre)

          const message = await client.messages.create({
            body: mensajePersonalizado,
            from: twilioPhone,
            to: numeroValido
          })

          resultados.push({
            votante: votante.nombre,
            telefono: numeroValido,
            messageId: message.sid,
            estado: 'enviado'
          })

          // Pequeña pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error: any) {
          errores.push({ votante: votante.nombre, error: error.message })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Proceso completado`,
        enviados: resultados.length,
        fallidos: errores.length,
        detalles: { resultados, errores }
      })
    }

  } catch (error: any) {
    console.error('Error enviando SMS:', error)
    return NextResponse.json(
      { error: 'Error al enviar SMS', detalle: error.message },
      { status: 500 }
    )
  }
}

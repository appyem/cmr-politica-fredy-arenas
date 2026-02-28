import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votante = await db.votante.findUnique({
      where: { id: params.id },
      include: {
        mensajes: true
      }
    })

    if (!votante) {
      return NextResponse.json(
        { error: 'Votante no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(votante)
  } catch (error) {
    console.error('Error fetching votante:', error)
    return NextResponse.json(
      { error: 'Error al obtener votante' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validación básica
    if (!body.nombre || !body.cedula) {
      return NextResponse.json(
        { error: 'Nombre y cédula son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si la cédula ya existe en otro votante
    const cedulaExistente = await db.votante.findFirst({
      where: { 
        cedula: body.cedula,
        NOT: { id: params.id }
      }
    })

    if (cedulaExistente) {
      return NextResponse.json(
        { error: 'Cédula ya registrada' },
        { status: 409 }
      )
    }

    const votanteActualizado = await db.votante.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        cedula: body.cedula,
        email: body.email || null,
        telefono: body.telefono || null,
        whatsapp: body.whatsapp || null,
        instagram: body.instagram || null,
        edad: body.edad ? parseInt(body.edad) : null,
        genero: body.genero || null,
        estado: body.estado || 'potencial',
        departamento: body.departamento || null,
        municipio: body.municipio || null,
        barrio: body.barrio || null,
        lugarCiudad: body.lugarCiudad || null,
        lugarPuesto: body.lugarPuesto || null,
        lugarMesa: body.lugarMesa || null,
        lugarDireccion: body.lugarDireccion || null,
        lugarDepartamento: body.lugarDepartamento || null,
        ocupacion: body.ocupacion || null,
        nivelEstudio: body.nivelEstudio || null,
        intereses: body.intereses || null,
        notas: body.notas || null
      }
    })

    return NextResponse.json(votanteActualizado)
  } catch (error: any) {
    console.error('Error updating votante:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cédula ya registrada' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar votante' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.votante.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Votante eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting votante:', error)
    return NextResponse.json(
      { error: 'Error al eliminar votante' },
      { status: 500 }
    )
  }
}
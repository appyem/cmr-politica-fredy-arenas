import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const votantes = await db.votante.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(votantes)
  } catch (error) {
    console.error('Error al obtener votantes:', error)
    return NextResponse.json({ error: 'Error al obtener votantes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validación básica
    if (!body.cedula || !body.nombre) {
      return NextResponse.json(
        { error: 'Cédula y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar cédula duplicada
    const existingVotante = await db.votante.findUnique({
      where: { cedula: body.cedula }
    })

    if (existingVotante) {
      return NextResponse.json(
        { error: 'Ya existe un votante con esta cédula' },
        { status: 400 }
      )
    }

    // Crear votante con campos planos
    const votante = await db.votante.create({
      data: {
        cedula: body.cedula,
        nombre: body.nombre,
        email: body.email || null,
        telefono: body.telefono || null,
        whatsapp: body.whatsapp || null,
        instagram: body.instagram || null,
        edad: body.edad ? parseInt(body.edad, 10) : null,
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

    return NextResponse.json(votante, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear votante:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Cédula ya registrada' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno al crear votante' },
      { status: 500 }
    )
  }
}
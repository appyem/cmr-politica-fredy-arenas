// src/app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Verificar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'El archivo debe ser de formato Excel (.xlsx o .xls)' },
        { status: 400 }
      )
    }

    // Leer el archivo Excel (simulado por ahora)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Aquí necesitaríamos una librería como xlsx para procesar el archivo
    // Por ahora, simulamos la lectura y procesamiento
    const mockVotantes = [
      {
        cedula: '123456789', // ✅ Agregado
        nombre: 'Juan Pérez',
        email: 'juan@email.com',
        telefono: '555-123-4567',
        whatsapp: '555-123-4567',
        edad: 35,
        genero: 'masculino',
        estado: 'potencial',
        colonia: 'Centro',
        municipio: 'Ciudad',
        seccion: '123',
        distrito: '5',
        ocupacion: 'Profesor',
        nivelEstudio: 'universidad'
      },
      {
        cedula: '987654321', // ✅ Agregado
        nombre: 'María García',
        email: 'maria@email.com',
        telefono: '555-987-6543',
        whatsapp: '555-987-6543',
        edad: 28,
        genero: 'femenino',
        estado: 'simpatizante',
        colonia: 'Norte',
        municipio: 'Villa',
        seccion: '456',
        distrito: '8',
        ocupacion: 'Enfermera',
        nivelEstudio: 'universidad'
      }
    ]

    // Guardar votantes en la base de datos
    const resultados = []
    for (const votanteData of mockVotantes) {
      try {

        

        const votante = await db.votante.create({
          data: votanteData
        })
        resultados.push({ success: true, votante })
      } catch (error) {
        resultados.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Error desconocido',
          data: votanteData 
        })
      }
    }

    const exitosos = resultados.filter(r => r.success).length
    const fallidos = resultados.filter(r => !r.success).length

    return NextResponse.json({
      message: `Importación completada. ${exitosos} votantes importados exitosamente, ${fallidos} con errores.`,
      resultados: {
        total: resultados.length,
        exitosos,
        fallidos,
        detalles: resultados
      }
    })

  } catch (error) {
    console.error('Error importando votantes:', error)
    return NextResponse.json(
      { error: 'Error al importar votantes' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Generar y descargar modelo de Excel
    const modelo = [
      ['nombre', 'email', 'telefono', 'whatsapp', 'edad', 'genero', 'estado', 'colonia', 'municipio', 'seccion', 'distrito', 'ocupacion', 'nivelEstudio', 'intereses', 'notas'],
      ['Juan Pérez', 'juan@email.com', '555-123-4567', '555-123-4567', '35', 'masculino', 'potencial', 'Centro', 'Ciudad', '123', '5', 'Profesor', 'universidad', 'Política, Educación', 'Votante clave'],
      ['María García', 'maria@email.com', '555-987-6543', '555-987-6543', '28', 'femenino', 'simpatizante', 'Norte', 'Villa', '456', '8', 'Enfermera', 'universidad', 'Salud, Comunidad', 'Líder comunitaria']
    ]

    // Aquí generaríamos un archivo Excel real
    // Por ahora, devolvemos el modelo como JSON
    return NextResponse.json({
      message: 'Modelo de Excel para importación de votantes',
      columnas: modelo[0],
      ejemplo: modelo.slice(1),
      instrucciones: {
        requeridos: ['nombre'],
        opcionales: ['email', 'telefono', 'whatsapp', 'edad', 'genero', 'colonia', 'municipio', 'seccion', 'distrito', 'ocupacion', 'nivelEstudio', 'intereses', 'notas'],
        estados: ['potencial', 'simpatizante', 'voluntario', 'indeciso'],
        generos: ['masculino', 'femenino', 'otro'],
        nivelesEstudio: ['primaria', 'secundaria', 'preparatoria', 'universidad', 'posgrado']
      }
    })
  } catch (error) {
    console.error('Error generando modelo de Excel:', error)
    return NextResponse.json(
      { error: 'Error al generar modelo de Excel' },
      { status: 500 }
    )
  }
}
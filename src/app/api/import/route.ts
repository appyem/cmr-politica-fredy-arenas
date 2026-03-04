import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

interface VotanteExcel {
  cedula?: string | number
  nombre?: string
  email?: string
  telefono?: string
  whatsapp?: string
  instagram?: string
  edad?: string | number
  genero?: string
  estado?: string
  departamento?: string
  municipio?: string
  barrio?: string
  ocupacion?: string
  nivelEstudio?: string
  intereses?: string
  notas?: string
}

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

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir a JSON
    const data = XLSX.utils.sheet_to_json(worksheet) as VotanteExcel[]
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'El archivo Excel está vacío' },
        { status: 400 }
      )
    }

    // Validar y guardar votantes
    const resultados = []
    for (const row of data) {
      try {
        // Validar campos requeridos
        if (!row.cedula || !row.nombre) {
          resultados.push({ 
            success: false, 
            error: 'Cédula y nombre son requeridos',
            data: row 
          })
          continue
        }

        // Verificar si la cédula ya existe
        const existente = await db.votante.findUnique({
          where: { cedula: String(row.cedula) }
        })

        if (existente) {
          resultados.push({ 
            success: false, 
            error: 'Cédula ya registrada',
            data: row 
          })
          continue
        }

        // Crear votante
        const votante = await db.votante.create({
          data: {
            cedula: String(row.cedula),
            nombre: String(row.nombre),
            email: row.email ? String(row.email) : null,
            telefono: row.telefono ? String(row.telefono) : null,
            whatsapp: row.whatsapp ? String(row.whatsapp) : null,
            instagram: row.instagram ? String(row.instagram) : null,
            edad: row.edad ? parseInt(String(row.edad)) : null,
            genero: row.genero ? String(row.genero) : null,
            estado: row.estado ? String(row.estado) : 'potencial',
            departamento: 'Caldas',
            municipio: row.municipio ? String(row.municipio) : null,
            barrio: row.barrio ? String(row.barrio) : null,
            ocupacion: row.ocupacion ? String(row.ocupacion) : null,
            nivelEstudio: row.nivelEstudio ? String(row.nivelEstudio) : null,
            intereses: row.intereses ? String(row.intereses) : null,
            notas: row.notas ? String(row.notas) : null
          }
        })
        resultados.push({ success: true, votante })
      } catch (error: any) {
        resultados.push({ 
          success: false, 
          error: error.message || 'Error desconocido',
          data: row 
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

  } catch (error: any) {
    console.error('Error importando votantes:', error)
    return NextResponse.json(
      { error: 'Error al importar votantes: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const csvContent = [
      ['cedula', 'nombre', 'email', 'telefono', 'whatsapp', 'instagram', 'edad', 'genero', 'estado', 'departamento', 'municipio', 'barrio', 'ocupacion', 'nivelEstudio', 'intereses', 'notas'],
      ['123456789', 'Juan Pérez', 'juan@email.com', '3001234567', '3001234567', '@juanperez', '35', 'masculino', 'potencial', 'Caldas', 'Manizales', 'Centro', 'Profesor', 'universidad', 'Política, Educación', 'Votante clave'],
      ['987654321', 'María García', 'maria@email.com', '3009876543', '3009876543', '@mariag', '28', 'femenino', 'simpatizante', 'Caldas', 'Manizales', 'Norte', 'Enfermera', 'universidad', 'Salud, Comunidad', 'Líder comunitaria']
    ].map(row => row.join(',')).join('\n')
    
    return NextResponse.json({
      message: 'Modelo de Excel para importación de votantes',
      columnas: csvContent.split('\n')[0].split(','),
      ejemplo: csvContent.split('\n').slice(1),
      instrucciones: {
        requeridos: ['cedula', 'nombre'],
        opcionales: ['email', 'telefono', 'whatsapp', 'instagram', 'edad', 'genero', 'estado', 'departamento', 'municipio', 'barrio', 'ocupacion', 'nivelEstudio', 'intereses', 'notas'],
        estados: ['potencial', 'simpatizante', 'voluntario', 'indeciso', 'lider', 'coordinador'],
        generos: ['masculino', 'femenino', 'otro'],
        nivelesEstudio: ['primaria', 'secundaria', 'preparatoria', 'universidad', 'posgrado'],
        municipios: ['Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 'La Dorada', 'La Merced', 'Manizales', 'Manzanares', 'Marmato', 'Marquetalia', 'Marulanda', 'Neira', 'Norcasia', 'Pácora', 'Palestina', 'Pensilvania', 'Riosucio', 'Risaralda', 'Salamina', 'Samaná', 'San José', 'Supía', 'Victoria', 'Villamaría', 'Viterbo']
      }
    })
  } catch (error: any) {
    console.error('Error generando modelo de Excel:', error)
    return NextResponse.json(
      { error: 'Error al generar modelo de Excel' },
      { status: 500 }
    )
  }
}

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

    // ✅ FILTRAR solo filas válidas (con cedula y nombre)
    const votantesValidos = data.filter(row => row.cedula && row.nombre)
    const votantesInvalidos = data.filter(row => !row.cedula || !row.nombre)

    if (votantesValidos.length === 0) {
      return NextResponse.json(
        { error: 'No hay filas válidas. Todas deben tener cédula y nombre' },
        { status: 400 }
      )
    }

    // ✅ VERIFICAR cédulas duplicadas DENTRO del archivo
    const cedulasEnArchivo = votantesValidos.map(r => String(r.cedula).trim())
    const cedulasRepetidasEnArchivo: string[] = []
    const cedulasUnicasSet = new Set<string>()
    
    cedulasEnArchivo.forEach(cedula => {
      if (cedulasUnicasSet.has(cedula)) {
        if (!cedulasRepetidasEnArchivo.includes(cedula)) {
          cedulasRepetidasEnArchivo.push(cedula)
        }
      } else {
        cedulasUnicasSet.add(cedula)
      }
    })

    if (cedulasRepetidasEnArchivo.length > 0) {
      return NextResponse.json(
        { error: `Cédulas repetidas en el archivo: ${cedulasRepetidasEnArchivo.join(', ')}` },
        { status: 400 }
      )
    }

    // ✅ VERIFICAR teléfonos duplicados DENTRO del archivo (telefono y whatsapp)
    const telefonosEnArchivo: string[] = []
    const telefonosRepetidosEnArchivo: string[] = []
    const telefonosUnicosSet = new Set<string>()
    
    votantesValidos.forEach(row => {
      const telefono = row.telefono ? String(row.telefono).replace(/\D/g, '') : null
      const whatsapp = row.whatsapp ? String(row.whatsapp).replace(/\D/g, '') : null
      
      if (telefono) {
        if (telefonosUnicosSet.has(telefono)) {
          if (!telefonosRepetidosEnArchivo.includes(telefono)) {
            telefonosRepetidosEnArchivo.push(telefono)
          }
        } else {
          telefonosUnicosSet.add(telefono)
        }
        telefonosEnArchivo.push(telefono)
      }
      
      if (whatsapp && whatsapp !== telefono) {
        if (telefonosUnicosSet.has(whatsapp)) {
          if (!telefonosRepetidosEnArchivo.includes(whatsapp)) {
            telefonosRepetidosEnArchivo.push(whatsapp)
          }
        } else {
          telefonosUnicosSet.add(whatsapp)
        }
        telefonosEnArchivo.push(whatsapp)
      }
    })

    // ✅ VERIFICAR cédulas que ya existen en la base de datos
    const cedulasUnicas = Array.from(cedulasUnicasSet)
    const existentesDB = await db.votante.findMany({
      where: {
        cedula: {
          in: cedulasUnicas
        }
      },
      select: { cedula: true }
    })
    const cedulasExistentesDB = new Set(existentesDB.map(e => e.cedula))

    // ✅ VERIFICAR teléfonos que ya existen en la base de datos
    const telefonosLimpios = Array.from(telefonosUnicosSet)
    const telefonosExistentesDB = await db.votante.findMany({
      where: {
        OR: [
          { telefono: { in: telefonosLimpios } },
          { whatsapp: { in: telefonosLimpios } }
        ]
      },
      select: { telefono: true, whatsapp: true, cedula: true }
    })
    
    const telefonosEnDBSet = new Set<string>()
    telefonosExistentesDB.forEach(v => {
      if (v.telefono) telefonosEnDBSet.add(v.telefono.replace(/\D/g, ''))
      if (v.whatsapp) telefonosEnDBSet.add(v.whatsapp.replace(/\D/g, ''))
    })

    // ✅ PREPARAR votantes para crear (solo los que NO tienen duplicados)
    const votantesACrear = []
    const votantesRechazados = []

    for (const row of votantesValidos) {
      const cedula = String(row.cedula).trim()
      const telefono = row.telefono ? String(row.telefono).replace(/\D/g, '') : null
      const whatsapp = row.whatsapp ? String(row.whatsapp).replace(/\D/g, '') : null
      
      // Verificar si la cédula ya existe en DB
      if (cedulasExistentesDB.has(cedula)) {
        votantesRechazados.push({
          cedula,
          nombre: String(row.nombre),
          error: 'Cédula ya registrada en la base de datos'
        })
        continue
      }

      // Verificar si el teléfono ya existe en DB
      let telefonoRepetido = false
      if (telefono && telefonosEnDBSet.has(telefono)) {
        votantesRechazados.push({
          cedula,
          nombre: String(row.nombre),
          error: `Teléfono ${telefono} ya registrado en la base de datos`
        })
        telefonoRepetido = true
        continue
      }

      // Verificar si el whatsapp ya existe en DB (y es diferente al telefono)
      if (whatsapp && whatsapp !== telefono && telefonosEnDBSet.has(whatsapp)) {
        votantesRechazados.push({
          cedula,
          nombre: String(row.nombre),
          error: `WhatsApp ${whatsapp} ya registrado en la base de datos`
        })
        continue
      }

      // ✅ Votante válido, agregar para crear
      votantesACrear.push({
        cedula,
        nombre: String(row.nombre),
        email: row.email ? String(row.email).trim() : null,
        telefono: telefono || null,
        whatsapp: whatsapp || null,
        instagram: row.instagram ? String(row.instagram).trim() : null,
        edad: row.edad ? parseInt(String(row.edad)) : null,
        genero: row.genero ? String(row.genero).trim() : null,
        estado: row.estado ? String(row.estado).trim() : 'potencial',
        departamento: 'Caldas',
        municipio: row.municipio ? String(row.municipio).trim() : null,
        barrio: row.barrio ? String(row.barrio).trim() : null,
        ocupacion: row.ocupacion ? String(row.ocupacion).trim() : null,
        nivelEstudio: row.nivelEstudio ? String(row.nivelEstudio).trim() : null,
        intereses: row.intereses ? String(row.intereses).trim() : null,
        notas: row.notas ? String(row.notas).trim() : null
      })
    }

    // ✅ CREAR votantes en lotes de 100 (para evitar timeout)
    const resultados = []
    const CHUNK_SIZE = 100

    for (let i = 0; i < votantesACrear.length; i += CHUNK_SIZE) {
      const chunk = votantesACrear.slice(i, i + CHUNK_SIZE)
      
      try {
        await db.votante.createMany({
          data: chunk,
          skipDuplicates: true
        })
        resultados.push(...chunk.map(c => ({ 
          success: true, 
          cedula: c.cedula,
          nombre: c.nombre 
        })))
      } catch (error: any) {
        resultados.push(...chunk.map(c => ({ 
          success: false, 
          cedula: c.cedula,
          error: error.message 
        })))
      }
    }

    // ✅ AGREGAR registros para los rechazados
    const invalidos = votantesInvalidos.map(row => ({
      success: false,
      cedula: row.cedula ? String(row.cedula) : 'N/A',
      nombre: row.nombre ? String(row.nombre) : 'N/A',
      error: 'Falta cédula o nombre'
    }))

    const exitosos = resultados.filter(r => r.success).length
    const fallidos = votantesRechazados.length + invalidos.length + resultados.filter(r => !r.success).length

    return NextResponse.json({
      message: `Importación completada. ${exitosos} votantes importados exitosamente, ${fallidos} rechazados.`,
      resultados: {
        total: data.length,
        exitosos,
        fallidos,
        cedulasRepetidasArchivo: cedulasRepetidasEnArchivo.length,
        telefonosRepetidosArchivo: telefonosRepetidosEnArchivo.length,
        cedulasExistentesDB: Array.from(cedulasExistentesDB).length,
        telefonosExistentesDB: telefonosEnDBSet.size,
        rechazados: votantesRechazados,
        invalidos: invalidos,
        detalles: [...votantesRechazados, ...invalidos, ...resultados.filter(r => !r.success)]
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
        validaciones: [
          '✅ La cédula debe ser única (no puede repetirse)',
          '✅ El teléfono debe ser único (no puede repetirse en otros votantes)',
          '✅ El WhatsApp debe ser único (no puede repetirse en otros votantes)',
          '✅ Teléfono y WhatsApp PUEDEN ser el mismo número para el mismo votante',
          '✅ El departamento siempre será "Caldas"',
          '✅ Los municipios deben ser de Caldas'
        ],
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

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

// Configuración de base de datos
const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function createAdminUser() {
  const email = 'admin@crm-politico.com'
  const username = 'admin'
  const password = 'admin123' // Cambia esto en producción
  
  // Hashear la contraseña
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'admin',
        name: 'Administrador'
      }
    })
    
    console.log('✅ Usuario administrador creado:')
    console.log(`Usuario: ${username}`)
    console.log(`Contraseña: ${password}`)
    console.log(`Email: ${email}`)
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️ El usuario administrador ya existe')
    } else {
      console.error('❌ Error al crear usuario:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
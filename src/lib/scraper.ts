import puppeteer, { Browser, Page } from 'puppeteer'

export interface LugarVotacion {
  ciudad: string
  puesto: string
  mesa: string
  direccion: string
  departamento: string
}

export interface ValidacionCedula {
  existe: boolean
  nombre?: string
  lugarVotacion?: LugarVotacion
  error?: string
}

export class RegistraduriaScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  async init(): Promise<void> {
    try {
      console.log('🚀 Inicializando navegador para scraping...')
      
      // Configuración optimizada para evitar detección
      this.browser = await puppeteer.launch({
        headless: true, // Cambiado de 'new' a true
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      })

      this.page = await this.browser.newPage()
      
      // Configurar página para evitar detección
      await this.page.setViewport({ width: 1366, height: 768 })
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Bloquear recursos innecesarios para acelerar
      await this.page.setRequestInterception(true)
      this.page.on('request', (req) => {
        const resourceType = req.resourceType()
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort()
        } else {
          req.continue()
        }
      })

      console.log('✅ Navegador inicializado correctamente')
    } catch (error) {
      console.error('❌ Error inicializando navegador:', error)
      throw new Error('No se pudo inicializar el navegador para scraping')
    }
  }

  async validarCedula(cedula: string): Promise<ValidacionCedula> {
    if (!this.page || !this.browser) {
      await this.init()
    }

    if (!this.page || !this.browser) {
      throw new Error('No se pudo inicializar el navegador')
    }

    try {
      console.log(`🔍 Validando cédula: ${cedula}`)
      
      // Paso 1: Navegar a la página de la Registraduría
      await this.page.goto('https://wsp.registraduria.gov.co/censo/consultar/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      // Esperar a que la página cargue completamente
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Paso 2: Verificar si hay CAPTCHA o bloqueo
      const bloqueado = await this.page.$('.cf-im-under-attack')
      if (bloqueado) {
        console.log('🚫 Sitio bloqueado por Cloudflare')
        return {
          existe: false,
          error: 'Sitio temporalmente bloqueado. Intente nuevamente en unos minutos.'
        }
      }

      // Paso 3: Buscar el campo de cédula
      const inputCedula = await this.page.waitForSelector('input[name="cedula"], input[placeholder*="cedula"], input[id*="cedula"]', {
        timeout: 10000
      })

      if (!inputCedula) {
        console.log('❌ No se encontró el campo de cédula')
        return {
          existe: false,
          error: 'No se encontró el campo de cédula en el formulario'
        }
      }

      // Paso 4: Limpiar y escribir la cédula
      await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input')
        inputs.forEach(input => {
          if (input.placeholder?.toLowerCase().includes('cedula') || 
              input.name?.toLowerCase().includes('cedula') ||
              input.id?.toLowerCase().includes('cedula')) {
            input.value = ''
          }
        })
      })

      await inputCedula.type(cedula, { delay: 100 })
      await new Promise(resolve => setTimeout(resolve, 500))

      // Paso 5: Buscar y hacer clic en el botón de consultar
      const botonConsultar = await this.page.$('button[type="submit"], button:contains("Consultar"), input[type="submit"]')
      
      if (!botonConsultar) {
        console.log('❌ No se encontró el botón de consultar')
        return {
          existe: false,
          error: 'No se encontró el botón de consulta'
        }
      }

      // Paso 6: Hacer clic en consultar
      await botonConsultar.click()
      
      // Paso 7: Esperar respuesta
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Paso 8: Analizar la respuesta
      const resultado = await this.page.evaluate(() => {
        // Buscar mensajes de error
        const mensajesError = Array.from(document.querySelectorAll('.alert, .error, .mensaje-error, [class*="error"]'))
        for (const msg of mensajesError) {
          const texto = msg.textContent?.toLowerCase()
          if (texto?.includes('no registra') || texto?.includes('no encontrado') || texto?.includes('inválida')) {
            return { existe: false, mensaje: msg.textContent }
          }
        }

        // Buscar datos del votante
        const datosVotante = Array.from(document.querySelectorAll('.resultado, .datos-votante, .info-votante, table tr'))
        
        if (datosVotante.length > 0) {
          // Extraer información del lugar de votación
          let lugarVotacion = null
          
          // Buscar en tablas
          const tablas = Array.from(document.querySelectorAll('table'))
          for (const tabla of tablas) {
            const filas = Array.from(tabla.querySelectorAll('tr'))
            for (const fila of filas) {
              const texto = fila.textContent?.toLowerCase()
              if (texto?.includes('puesto') || texto?.includes('mesa') || texto?.includes('lugar')) {
                lugarVotacion = this.extraerLugarVotacion(fila)
                break
              }
            }
            if (lugarVotacion) break
          }

          // Buscar en divs si no encontró en tablas
          if (!lugarVotacion) {
            const divs = Array.from(document.querySelectorAll('div'))
            for (const div of divs) {
              const texto = div.textContent?.toLowerCase()
              if (texto?.includes('puesto') || texto?.includes('mesa') || texto?.includes('lugar')) {
                lugarVotacion = this.extraerLugarVotacion(div)
                break
              }
            }
          }

          return { 
            existe: true, 
            lugarVotacion,
            pagina: document.body.innerHTML
          }
        }

        return { existe: false }
      })

      if (resultado.existe && resultado.lugarVotacion) {
        console.log('✅ Cédula encontrada con lugar de votación')
        return {
          existe: true,
          lugarVotacion: resultado.lugarVotacion
        }
      } else if (resultado.existe === false) {
        console.log('❌ Cédula no registrada')
        return {
          existe: false,
          error: 'La cédula no se encuentra registrada en el censo electoral.'
        }
      } else {
        console.log('⚠️ Respuesta ambigua')
        return {
          existe: false,
          error: 'No se pudo interpretar la respuesta del sitio. Intente nuevamente.'
        }
      }

    } catch (error) {
      console.error('❌ Error en validación:', error)
      
      // Capturar screenshot para depuración
      try {
        const screenshot = await this.page?.screenshot({ encoding: 'base64' })
        console.log('📸 Captura de pantalla guardada para depuración')
      } catch (e) {
        console.log('No se pudo capturar pantalla')
      }

      return {
        existe: false,
        error: 'Error al validar la cédula. Intente nuevamente.'
      }
    }
  }

  private extraerLugarVotacion(elemento: Element): LugarVotacion | null {
    try {
      const texto = elemento.textContent || ''
      
      // Patrones de búsqueda
      const patrones = [
        /puesto:\s*(\d+)/i,
        /mesa:\s*(\d+)/i,
        /ciudad:\s*([^,\n]+)/i,
        /dirección:\s*([^,\n]+)/i,
        /departamento:\s*([^,\n]+)/i
      ]

      const resultado: Partial<LugarVotacion> = {}

      patrones.forEach(patron => {
        const match = texto.match(patron)
        if (match) {
          switch (patron.source) {
            case /puesto:/i.source:
              resultado.puesto = match[1]?.trim()
              break
            case /mesa:/i.source:
              resultado.mesa = match[1]?.trim()
              break
            case /ciudad:/i.source:
              resultado.ciudad = match[1]?.trim()
              break
            case /dirección:/i.source:
              resultado.direccion = match[1]?.trim()
              break
            case /departamento:/i.source:
              resultado.departamento = match[1]?.trim()
              break
          }
        }
      })

      // Si no se encontró con patrones, intentar extraer con heurísticas
      if (!resultado.puesto || !resultado.mesa) {
        const lineas = texto.split('\n')
        lineas.forEach(linea => {
          if (linea.includes('Puesto') || /\d{1,4}/.test(linea)) {
            resultado.puesto = resultado.puesto || linea.match(/\d{1,4}/)?.[0]
          }
          if (linea.includes('Mesa')) {
            resultado.mesa = resultado.mesa || linea.match(/\d{1,3}/)?.[0]
          }
        })
      }

      // Valores por defecto si no se encontraron
      resultado.ciudad = resultado.ciudad || 'No especificada'
      resultado.puesto = resultado.puesto || 'No especificado'
      resultado.mesa = resultado.mesa || 'No especificada'
      resultado.direccion = resultado.direccion || 'No especificada'
      resultado.departamento = resultado.departamento || 'No especificado'

      return resultado as LugarVotacion
    } catch (error) {
      console.error('Error extrayendo lugar de votación:', error)
      return null
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close()
        this.page = null
      }
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
      console.log('✅ Navegador cerrado correctamente')
    } catch (error) {
      console.error('❌ Error cerrando navegador:', error)
    }
  }
}

// Instancia global para reutilizar
export const scraperInstance = new RegistraduriaScraper()
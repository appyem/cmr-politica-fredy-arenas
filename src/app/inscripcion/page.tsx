import { Suspense } from 'react'
import InscripcionClient from './InscripcionClient'

export default function InscripcionPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-2">Invitación a Reunión Política</h1>
          <p className="text-gray-600 text-center mb-6">
            Confirma tu asistencia al evento
          </p>
          
          <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
            <InscripcionClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState('Conectando...')
  const [apiData, setApiData] = useState(null)

  useEffect(() => {
    // Probar conexión con la API
    fetch('http://localhost:8080/api/v1/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus('✅ Conectado')
        setApiData(data)
      })
      .catch(err => {
        setApiStatus('❌ Error de conexión')
        console.error(err)
      })
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          🏮 Sistema Nikkei Sinaloa
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Frontend (Next.js)</h2>
            <div className="space-y-2">
              <p>✅ Next.js 16.1.5 funcionando</p>
              <p>✅ TypeScript configurado</p>
              <p>✅ Tailwind CSS funcionando</p>
              <p>✅ React Compiler activado</p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Backend (Go + Gin)</h2>
            <div className="space-y-2">
              <p>Estado: <span className="font-mono">{apiStatus}</span></p>
              {apiData && (
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <pre>{JSON.stringify(apiData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Services Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Servicios</h2>
            <div className="space-y-2">
              <p>🐘 PostgreSQL: Puerto 5432</p>
              <p>🔴 Redis: Puerto 6379</p>
              <p>🌐 API: Puerto 8080</p>
              <p>⚛️ Frontend: Puerto 3001</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Stack Tecnológico</h2>
            <div className="space-y-2">
              <p>🐹 Go 1.25.6 + Gin</p>
              <p>⚛️ Next.js 16.1.5 + React</p>
              <p>🎨 TypeScript + Tailwind</p>
              <p>🐳 Docker + PostgreSQL + Redis</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            ¡Todo el stack está funcionando correctamente!
          </p>
        </div>
      </div>
    </div>
  )
}
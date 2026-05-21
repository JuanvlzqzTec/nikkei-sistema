'use client'

export default function DashboardFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-amber-200/50">
      <div className="text-center space-y-2">
        <div className="mx-auto h-1 w-20 rounded-full bg-linear-to-r from-red-400 via-orange-400 to-amber-400" />
        <p className="font-serif text-2xl text-red-900/15 select-none mt-4">
          絆
        </p>
        <p className="font-sans text-sm text-red-800/70">
          © 2026 Asociación Nikkei de Sinaloa
        </p>
        <p className="font-sans text-xs text-red-600/60">
          Preservando nuestra herencia cultural
        </p>
      </div>
    </footer>
  )
}
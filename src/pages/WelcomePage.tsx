import { APP_CONFIG } from '@/config/app'

/**
 * Página provisional de la v0.1: confirma que el shell, los tokens
 * de Aura Design y la PWA funcionan. Será reemplazada por el
 * Dashboard en la v0.4.
 */
export function WelcomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        aria-hidden
        className="size-20 rounded-aura-lg bg-gradient-to-br from-aura-400 to-aura-700 shadow-xl shadow-aura-500/30"
      />
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          {APP_CONFIG.name}
        </h1>
        <p className="max-w-sm text-balance text-ink-muted">
          El centro de tu hogar. Pagos, tareas, calendario y todo lo importante
          de tu día a día, en un solo lugar.
        </p>
      </div>
      <span className="rounded-full border border-line bg-surface-elevated px-3 py-1 text-xs text-ink-muted">
        v{APP_CONFIG.version} · Aura Design System
      </span>
    </main>
  )
}

import { APP_CONFIG } from '@/config/app'

/**
 * Página de bienvenida (v0.1). Se conservará como base del onboarding;
 * el Dashboard tomará su lugar como pantalla principal en la v0.5.
 */
export function WelcomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        aria-hidden
        className="size-20 rounded-2xl bg-gradient-to-br from-aura-400 to-aura-700 shadow-xl shadow-aura-500/30"
      />
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          {APP_CONFIG.name}
        </h1>
        <p className="max-w-sm text-balance text-muted-foreground">
          El centro de tu hogar. Pagos, tareas, calendario y todo lo importante
          de tu día a día, en un solo lugar.
        </p>
      </div>
      <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
        v{APP_CONFIG.version} · Aura Design System
      </span>
    </main>
  )
}

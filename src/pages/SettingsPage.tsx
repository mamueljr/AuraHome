import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, HardDrive, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { queryKeys } from '@/config/query-client'
import {
  eventsRepo,
  servicesRepo,
  shoppingRepo,
  tasksRepo,
} from '@/repositories'
import { downloadBackup, importBackup } from '@/services/backup.service'

const STATS = [
  ['Servicios', servicesRepo],
  ['Tareas', tasksRepo],
  ['Compras', shoppingRepo],
  ['Eventos', eventsRepo],
] as const

type Feedback = { kind: 'ok' | 'error'; message: string } | null

/** Ajustes: administración de los datos locales (respaldo e importación). */
export function SettingsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const { data: counts } = useQuery({
    queryKey: queryKeys.dataStats,
    queryFn: () => Promise.all(STATS.map(([, repo]) => repo.count())),
  })

  async function onImportFile(file: File) {
    try {
      const imported = await importBackup(await file.text())
      await queryClient.invalidateQueries()
      setFeedback({
        kind: 'ok',
        message: `Respaldo importado: ${imported} registros.`,
      })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Error al importar.',
      })
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" /> Tus datos
          </CardTitle>
          <CardDescription>
            Todo se guarda en este dispositivo. Aura Home funciona sin conexión
            y sin cuentas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(([label], i) => (
              <div
                key={label}
                className="rounded-xl border bg-muted/40 p-3 text-center"
              >
                <p className="font-heading text-xl font-semibold">
                  {counts?.[i] ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void downloadBackup()}>
              <Download /> Exportar respaldo
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload /> Importar respaldo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onImportFile(file)
                e.target.value = ''
              }}
            />
          </div>

          {feedback && (
            <p
              role="status"
              className={
                feedback.kind === 'ok'
                  ? 'text-sm text-primary'
                  : 'text-sm text-destructive'
              }
            >
              {feedback.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

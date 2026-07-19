import { BACKUP_TABLES, db, type BackupTable } from '@/repositories/db'
import { APP_CONFIG } from '@/config/app'
import type { BaseEntity } from '@/types/entities'

export interface AuraBackup {
  app: string
  appVersion: string
  schemaVersion: number
  exportedAt: string
  data: Record<BackupTable, BaseEntity[]>
}

/** Exporta toda la base local como objeto de respaldo serializable. */
export async function exportBackup(): Promise<AuraBackup> {
  const data = {} as AuraBackup['data']
  await db.transaction('r', BACKUP_TABLES.slice(), async () => {
    for (const table of BACKUP_TABLES) {
      data[table] = (await db.table(table).toArray()) as BaseEntity[]
    }
  })
  return {
    app: 'aura-home',
    appVersion: APP_CONFIG.version,
    schemaVersion: db.verno,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/** Descarga el respaldo como archivo JSON. */
export async function downloadBackup(): Promise<void> {
  const backup = await exportBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `aura-home-respaldo-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function isValidBackup(value: unknown): value is AuraBackup {
  if (typeof value !== 'object' || value === null) return false
  const backup = value as Partial<AuraBackup>
  return (
    backup.app === 'aura-home' &&
    typeof backup.data === 'object' &&
    backup.data !== null
  )
}

/**
 * Importa un respaldo fusionándolo con los datos existentes
 * (los registros con el mismo id se sobrescriben).
 * Devuelve el número de registros importados.
 */
export async function importBackup(json: string): Promise<number> {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  if (!isValidBackup(parsed)) {
    throw new Error('El archivo no es un respaldo de Aura Home.')
  }

  let imported = 0
  await db.transaction('rw', BACKUP_TABLES.slice(), async () => {
    for (const table of BACKUP_TABLES) {
      const rows = parsed.data[table]
      if (!Array.isArray(rows)) continue
      await db.table(table).bulkPut(rows)
      imported += rows.length
    }
  })
  return imported
}

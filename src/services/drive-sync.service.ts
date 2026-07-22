import { APP_CONFIG } from '@/config/app'
import { BACKUP_TABLES, db } from '@/repositories/db'
import { exportBackup, importBackup, type AuraBackup } from '@/services/backup.service'
import { useSyncStore } from '@/stores/sync.store'
import type { BaseEntity } from '@/types/entities'

/**
 * Sincronización de respaldos con Google Drive (appDataFolder).
 *
 * Sin backend propio: el respaldo JSON completo (backup.service) se guarda
 * en la carpeta oculta de la app dentro del Drive DEL USUARIO, vía OAuth2
 * en el navegador (Google Identity Services) y la API REST de Drive v3.
 * Sincronización por snapshot con última-escritura-gana; si ambos lados
 * cambiaron desde la última sincronización, se devuelve un conflicto para
 * que la UI pregunte. Las eliminaciones no se propagan (el import fusiona).
 */

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata openid email'
const FILE_NAME = 'aura-home-backup.json'
const GIS_SRC = 'https://accounts.google.com/gsi/client'
const TOKEN_TIMEOUT_MS = 15_000

/** Fallo de autenticación silenciosa: requiere interacción del usuario. */
export class SyncAuthError extends Error {
  constructor(message = 'Se requiere iniciar sesión con Google de nuevo.') {
    super(message)
    this.name = 'SyncAuthError'
  }
}

export type SyncResult =
  | { action: 'pushed' | 'up-to-date'; syncedAt: string }
  | { action: 'pulled'; syncedAt: string; imported: number }
  | { action: 'conflict'; localDate: string; remoteDate: string }

// ---------- Carga de GIS y tokens ----------

let gisPromise: Promise<void> | null = null

/** Carga el script de Google Identity Services (compartido con otras integraciones de Google). */
export function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  gisPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      gisPromise = null
      reject(new Error('No se pudo cargar Google Identity Services.'))
    }
    document.head.appendChild(script)
  })
  return gisPromise
}

let cachedToken: { value: string; expiresAt: number } | null = null

function requestToken(prompt: '' | 'consent'): Promise<string> {
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2
    if (!oauth2) {
      reject(new Error('Google Identity Services no está disponible.'))
      return
    }
    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new SyncAuthError())
      }
    }, TOKEN_TIMEOUT_MS)

    const knownEmail = useSyncStore.getState().accountEmail
    const client = oauth2.initTokenClient({
      client_id: APP_CONFIG.googleClientId,
      scope: SCOPE,
      // FedCM: el re-canje silencioso de tokens deja de depender de
      // cookies de terceros (Chrome las bloquea cada vez más), que era
      // la causa de que pidiera reconectar en cada recarga.
      use_fedcm_for_prompt: true,
      ...(knownEmail ? { hint: knownEmail } : {}),
      callback: (response) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        if (response.access_token) {
          cachedToken = {
            value: response.access_token,
            expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
          }
          resolve(response.access_token)
        } else {
          reject(new SyncAuthError(response.error))
        }
      },
      error_callback: (error) => {
        if (settled) return
        settled = true
        clearTimeout(timeout)
        reject(new SyncAuthError(error.message ?? error.type))
      },
    })
    client.requestAccessToken({ prompt })
  })
}

async function getAccessToken(opts?: { interactive?: boolean }): Promise<string> {
  if (!APP_CONFIG.googleClientId) {
    throw new Error('Falta configurar el Client ID de Google.')
  }
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.value
  }
  await loadGis()
  try {
    return await requestToken('')
  } catch (error) {
    if (opts?.interactive) return requestToken('consent')
    throw error instanceof SyncAuthError ? error : new SyncAuthError()
  }
}

// ---------- Llamadas REST a Drive ----------

async function authFetch(
  input: string,
  init: RequestInit,
  retried = false,
): Promise<Response> {
  const token = await getAccessToken()
  const response = await fetch(input, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  })
  if (response.status === 401 && !retried) {
    cachedToken = null
    return authFetch(input, init, true)
  }
  if (!response.ok) {
    throw new Error(`Error de Google Drive (${response.status}).`)
  }
  return response
}

async function findBackupFile(): Promise<string | null> {
  const cached = useSyncStore.getState().fileId
  if (cached) return cached
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id)',
    q: `name='${FILE_NAME}'`,
  })
  const response = await authFetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    { method: 'GET' },
  )
  const data = (await response.json()) as { files?: { id: string }[] }
  const id = data.files?.[0]?.id ?? null
  if (id) useSyncStore.getState().setFileId(id)
  return id
}

async function downloadBackupFile(fileId: string): Promise<AuraBackup> {
  const response = await authFetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { method: 'GET' },
  )
  return (await response.json()) as AuraBackup
}

async function uploadBackupFile(json: string, fileId: string | null): Promise<string> {
  const boundary = `aura_${crypto.randomUUID()}`
  const metadata = fileId
    ? { name: FILE_NAME }
    : { name: FILE_NAME, parents: ['appDataFolder'] }
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    `${json}\r\n` +
    `--${boundary}--`
  const url = fileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
  const response = await authFetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  const data = (await response.json()) as { id: string }
  useSyncStore.getState().setFileId(data.id)
  return data.id
}

async function fetchUserEmail(): Promise<string> {
  const response = await authFetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    method: 'GET',
  })
  const data = (await response.json()) as { email?: string }
  return data.email ?? 'cuenta de Google'
}

// ---------- Estado local ----------

/** Fecha (ISO) del cambio local más reciente, o null si no hay datos. */
async function getLatestLocalChange(): Promise<string | null> {
  let latest: string | null = null
  await db.transaction('r', BACKUP_TABLES.slice(), async () => {
    for (const table of BACKUP_TABLES) {
      const rows = (await db.table(table).toArray()) as BaseEntity[]
      for (const row of rows) {
        const stamp = row.updatedAt ?? row.createdAt
        if (stamp && (!latest || stamp > latest)) latest = stamp
      }
    }
  })
  return latest
}

// ---------- API pública ----------

async function push(): Promise<SyncResult> {
  const backup = await exportBackup()
  const fileId = useSyncStore.getState().fileId
  await uploadBackupFile(JSON.stringify(backup), fileId)
  useSyncStore.getState().setLastSync(backup.exportedAt)
  return { action: 'pushed', syncedAt: backup.exportedAt }
}

async function pull(fileId: string): Promise<SyncResult> {
  const remote = await downloadBackupFile(fileId)
  const imported = await importBackup(JSON.stringify(remote))
  const syncedAt = new Date().toISOString()
  useSyncStore.getState().setLastSync(syncedAt)
  return { action: 'pulled', syncedAt, imported }
}

/** Inicia sesión con Google (popup) y devuelve el correo conectado. */
export async function connect(): Promise<string> {
  await getAccessToken({ interactive: true })
  const email = await fetchUserEmail()
  useSyncStore.getState().setConnected(email)
  return email
}

/**
 * Sincroniza contra Drive según qué lado cambió desde la última vez.
 * Devuelve 'conflict' si ambos cambiaron; la UI decide con resolveConflict.
 */
export async function syncNow(opts?: { interactive?: boolean }): Promise<SyncResult> {
  await getAccessToken(opts)
  const { lastSyncAt } = useSyncStore.getState()

  const fileId = await findBackupFile()
  if (!fileId) return push()

  const remote = await downloadBackupFile(fileId)
  const localChange = await getLatestLocalChange()

  const remoteChanged = !lastSyncAt || remote.exportedAt > lastSyncAt
  const localChanged = lastSyncAt ? (localChange ?? '') > lastSyncAt : localChange !== null

  if (!remoteChanged && !localChanged) {
    const syncedAt = new Date().toISOString()
    useSyncStore.getState().setLastSync(syncedAt)
    return { action: 'up-to-date', syncedAt }
  }
  if (localChanged && !remoteChanged) return push()
  if (remoteChanged && !localChanged) {
    const imported = await importBackup(JSON.stringify(remote))
    const syncedAt = new Date().toISOString()
    useSyncStore.getState().setLastSync(syncedAt)
    return { action: 'pulled', syncedAt, imported }
  }
  return {
    action: 'conflict',
    localDate: localChange ?? new Date().toISOString(),
    remoteDate: remote.exportedAt,
  }
}

/** Resuelve un conflicto: 'local' sube este dispositivo, 'remote' trae Drive. */
export async function resolveConflict(choice: 'local' | 'remote'): Promise<SyncResult> {
  await getAccessToken({ interactive: true })
  if (choice === 'local') return push()
  const fileId = await findBackupFile()
  if (!fileId) return push()
  return pull(fileId)
}

/** Cierra la sesión: revoca el token y limpia el estado persistido. */
export function disconnect(): void {
  const token = cachedToken?.value
  if (token) window.google?.accounts?.oauth2?.revoke(token)
  cachedToken = null
  useSyncStore.getState().disconnect()
}

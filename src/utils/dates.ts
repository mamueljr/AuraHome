/** Utilidades de fechas. Trabajan con ISO (solo fecha o fecha-hora). */

const DAY_MS = 86_400_000

/** Normaliza a medianoche local para comparar solo fechas. */
function atMidnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Días (enteros) desde hoy hasta la fecha dada. Negativo si ya pasó. */
export function daysUntil(iso: string): number {
  return Math.round((atMidnight(new Date(iso)) - atMidnight(new Date())) / DAY_MS)
}

/** Etiqueta relativa amigable: "Hoy", "Mañana", "En 5 días", "Hace 2 días". */
export function relativeDayLabel(iso: string): string {
  const days = daysUntil(iso)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  if (days === -1) return 'Ayer'
  if (days > 1) return `En ${days} días`
  return `Hace ${-days} días`
}

/** "Viernes, 18 de julio" */
export function formatLongDate(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/** ¿La fecha ISO cae en el mes actual? */
export function isCurrentMonth(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

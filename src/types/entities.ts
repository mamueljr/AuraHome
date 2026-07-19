/**
 * Tipos del dominio de Aura Home.
 * Las fechas se guardan como ISO 8601 (string) para ser serializables
 * en IndexedDB y en los respaldos JSON.
 */

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

/** Datos necesarios para crear una entidad (el resto lo pone el repositorio). */
export type NewEntity<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>

// ---------- Servicios y pagos ----------

export const SERVICE_CATEGORIES = [
  'luz',
  'agua',
  'gas',
  'internet',
  'telefono',
  'streaming',
  'seguro',
  'predial',
  'hipoteca',
  'renta',
  'otro',
] as const
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const FREQUENCIES = [
  'unico',
  'semanal',
  'quincenal',
  'mensual',
  'bimestral',
  'trimestral',
  'semestral',
  'anual',
] as const
export type Frequency = (typeof FREQUENCIES)[number]

export interface Service extends BaseEntity {
  name: string
  category: ServiceCategory
  amount: number
  frequency: Frequency
  /** Próxima fecha de vencimiento (ISO, solo fecha). */
  nextDueDate: string
  /** Días de anticipación para recordar el pago. */
  reminderDaysBefore: number
  notes?: string
  /** 0 = activo, 1 = archivado (numérico para poder indexarse). */
  archived: 0 | 1
}

export interface ServicePayment extends BaseEntity {
  serviceId: string
  amount: number
  paidAt: string
  notes?: string
}

// ---------- Tareas ----------

export const PRIORITIES = ['baja', 'media', 'alta'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface TaskItem extends BaseEntity {
  title: string
  notes?: string
  priority: Priority
  dueDate?: string
  completedAt?: string
  tags: string[]
  /** Para subtareas: id de la tarea padre. */
  parentId?: string
}

// ---------- Compras ----------

export interface ShoppingItem extends BaseEntity {
  name: string
  category?: string
  quantity: number
  priority: Priority
  completedAt?: string
}

// ---------- Contactos ----------

export const CONTACT_CATEGORIES = [
  'familia',
  'emergencia',
  'salud',
  'servicios_hogar',
  'otro',
] as const
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]

export interface Contact extends BaseEntity {
  name: string
  category: ContactCategory
  /** Rol u oficio: "Plomero", "Doctora", "Hermana"… */
  role?: string
  phone?: string
  email?: string
  notes?: string
  /** Aparece siempre arriba, en la sección de emergencias. */
  isEmergency: boolean
}

// ---------- Mantenimiento ----------

export const MAINTENANCE_AREAS = [
  'casa',
  'vehiculo',
  'electrodomestico',
  'clima',
  'boiler',
  'jardin',
  'filtros',
  'otro',
] as const
export type MaintenanceArea = (typeof MAINTENANCE_AREAS)[number]

export interface MaintenanceRecord extends BaseEntity {
  title: string
  area: MaintenanceArea
  /** Fecha en que se realizó (ISO, solo fecha). */
  date: string
  cost?: number
  notes?: string
  /** Próximo mantenimiento sugerido (aparece en el calendario). */
  nextDate?: string
  /** Fotografías como data-URL JPEG comprimidas. */
  photos: string[]
}

// ---------- Calendario ----------

export const EVENT_KINDS = ['evento', 'cumpleanos', 'recordatorio'] as const
export type EventKind = (typeof EVENT_KINDS)[number]

export interface CalendarEvent extends BaseEntity {
  title: string
  kind: EventKind
  /** Fecha de inicio (ISO). */
  date: string
  endDate?: string
  allDay: boolean
  notes?: string
}

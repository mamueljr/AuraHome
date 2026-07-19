import Dexie, { type Table } from 'dexie'
import type {
  CalendarEvent,
  MaintenanceRecord,
  Service,
  ServicePayment,
  ShoppingItem,
  TaskItem,
} from '@/types/entities'

/**
 * Base de datos local de Aura Home (IndexedDB vía Dexie).
 *
 * Migraciones: cada cambio de esquema incrementa `.version(n)`.
 * Nunca se modifica una versión ya publicada; se agrega una nueva
 * con su `upgrade()` si hace falta transformar datos.
 */
export class AuraDatabase extends Dexie {
  services!: Table<Service, string>
  servicePayments!: Table<ServicePayment, string>
  tasks!: Table<TaskItem, string>
  shoppingItems!: Table<ShoppingItem, string>
  events!: Table<CalendarEvent, string>
  maintenance!: Table<MaintenanceRecord, string>

  constructor() {
    super('aura-home')
    this.version(1).stores({
      services: 'id, category, nextDueDate, archived',
      servicePayments: 'id, serviceId, paidAt',
      tasks: 'id, dueDate, completedAt, parentId, priority',
      shoppingItems: 'id, completedAt, category',
      events: 'id, date, kind',
    })
    // v2 (app v0.10): módulo de mantenimiento
    this.version(2).stores({
      maintenance: 'id, area, date, nextDate',
    })
  }
}

export const db = new AuraDatabase()

/** Nombres de tablas incluidas en respaldos (export/import). */
export const BACKUP_TABLES = [
  'services',
  'servicePayments',
  'tasks',
  'shoppingItems',
  'events',
  'maintenance',
] as const
export type BackupTable = (typeof BACKUP_TABLES)[number]

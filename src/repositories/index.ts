import { BaseRepository } from '@/repositories/base.repository'
import { db } from '@/repositories/db'
import type {
  CalendarEvent,
  Service,
  ServicePayment,
  ShoppingItem,
  TaskItem,
} from '@/types/entities'

/** Repositorios concretos — punto de acceso a datos de toda la app. */
export const servicesRepo = new BaseRepository<Service>(db.services)
export const servicePaymentsRepo = new BaseRepository<ServicePayment>(
  db.servicePayments,
)
export const tasksRepo = new BaseRepository<TaskItem>(db.tasks)
export const shoppingRepo = new BaseRepository<ShoppingItem>(db.shoppingItems)
export const eventsRepo = new BaseRepository<CalendarEvent>(db.events)

export { db } from '@/repositories/db'
export { BaseRepository } from '@/repositories/base.repository'

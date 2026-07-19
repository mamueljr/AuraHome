import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-client'
import {
  contactsRepo,
  eventsRepo,
  maintenanceRepo,
  servicePaymentsRepo,
  servicesRepo,
  shoppingRepo,
  tasksRepo,
} from '@/repositories'

/** Hooks de lectura por entidad. Cada mutación futura invalida su queryKey. */

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: () => servicesRepo.getAll(),
  })
}

export function useServicePayments() {
  return useQuery({
    queryKey: queryKeys.servicePayments,
    queryFn: () => servicePaymentsRepo.getAll(),
  })
}

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => tasksRepo.getAll(),
  })
}

export function useShoppingItems() {
  return useQuery({
    queryKey: queryKeys.shopping,
    queryFn: () => shoppingRepo.getAll(),
  })
}

export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: () => eventsRepo.getAll(),
  })
}

export function useMaintenance() {
  return useQuery({
    queryKey: queryKeys.maintenance,
    queryFn: () => maintenanceRepo.getAll(),
  })
}

export function useContacts() {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => contactsRepo.getAll(),
  })
}

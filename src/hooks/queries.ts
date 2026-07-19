import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-client'
import {
  eventsRepo,
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

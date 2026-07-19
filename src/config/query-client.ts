import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente de TanStack Query. Los datos viven en IndexedDB (local),
 * así que se consideran frescos hasta que una mutación los invalide.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Claves de query centralizadas para invalidación consistente. */
export const queryKeys = {
  services: ['services'] as const,
  servicePayments: ['servicePayments'] as const,
  tasks: ['tasks'] as const,
  shopping: ['shopping'] as const,
  events: ['events'] as const,
  maintenance: ['maintenance'] as const,
  contacts: ['contacts'] as const,
  dataStats: ['dataStats'] as const,
}

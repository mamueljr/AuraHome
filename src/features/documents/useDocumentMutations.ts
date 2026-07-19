import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-client'
import { documentsRepo } from '@/repositories'
import type { AuraDocument, NewEntity } from '@/types/entities'

/** Mutaciones del módulo de documentos con invalidación automática. */
export function useDocumentMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dataStats }),
    ])

  const createDocument = useMutation({
    mutationFn: (data: NewEntity<AuraDocument>) => documentsRepo.create(data),
    onSuccess: invalidate,
  })

  const updateDocument = useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string
      changes: Partial<NewEntity<AuraDocument>>
    }) => documentsRepo.update(id, changes),
    onSuccess: invalidate,
  })

  const removeDocument = useMutation({
    mutationFn: (id: string) => documentsRepo.remove(id),
    onSuccess: invalidate,
  })

  return { createDocument, updateDocument, removeDocument }
}

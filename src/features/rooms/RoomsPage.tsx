import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/EmptyState'
import { useHomeItems, useRooms } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import { parseLocalDate } from '@/utils/dates'
import type { HomeItem, Room } from '@/types/entities'
import { ITEM_CATEGORY_META, ROOM_TYPE_META } from './room-meta'
import { RoomFormDialog } from './RoomFormDialog'
import { ItemFormDialog } from './ItemFormDialog'
import { useRoomMutations } from './useRoomMutations'

function RoomCard({
  room,
  itemCount,
  selected,
  onSelect,
}: {
  room: Room
  itemCount: number
  selected: boolean
  onSelect: () => void
}) {
  const meta = ROOM_TYPE_META[room.type]
  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center transition-colors',
        selected ? 'border-primary bg-accent' : 'hover:bg-accent/50',
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <meta.icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{room.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {itemCount === 0 ? 'Sin objetos' : `${itemCount} ${itemCount === 1 ? 'objeto' : 'objetos'}`}
        </p>
      </div>
    </motion.button>
  )
}

function ItemCard({
  item,
  onEdit,
  onRemove,
}: {
  item: HomeItem
  onEdit: () => void
  onRemove: () => void
}) {
  const meta = ITEM_CATEGORY_META[item.category]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent text-accent-foreground"
            aria-label={`Editar ${item.name}`}
          >
            {item.photo ? (
              <img src={item.photo} alt="" className="size-full object-cover" />
            ) : (
              <meta.icon className="size-5" />
            )}
          </button>
          <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
            <p className="truncate font-medium">{item.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {item.brand ? `${item.brand} · ${meta.label}` : meta.label}
              {item.purchaseDate &&
                ` · ${parseLocalDate(item.purchaseDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </p>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label={`Opciones de ${item.name}`}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onRemove}>
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Módulo Mi Hogar: la vivienda representada por habitaciones, con su inventario. */
export function RoomsPage() {
  const { data: rooms = [] } = useRooms()
  const { data: allItems = [] } = useHomeItems()
  const {
    createRoom,
    updateRoom,
    removeRoom,
    createItem,
    updateItem,
    removeItem,
  } = useRoomMutations()

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [roomFormOpen, setRoomFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  /** null = cerrado; { item: null } = alta; { item } = edición. */
  const [itemDialog, setItemDialog] = useState<{ item: HomeItem | null } | null>(null)

  const itemsByRoom = useMemo(() => {
    const map = new Map<string, HomeItem[]>()
    for (const item of allItems) {
      const list = map.get(item.roomId) ?? []
      list.push(item)
      map.set(item.roomId, list)
    }
    return map
  }, [allItems])

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null
  const selectedItems = selectedRoom ? (itemsByRoom.get(selectedRoom.id) ?? []) : []

  function openCreateRoom() {
    setEditingRoom(null)
    setRoomFormOpen(true)
  }

  function openCreateItem() {
    setItemDialog({ item: null })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rooms.length === 0 ? 'Organiza tu casa por habitaciones' : `${rooms.length} habitaciones`}
        </p>
        <Button onClick={openCreateRoom}>
          <Plus /> Nueva habitación
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon={Home} message="Aún no registras habitaciones." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <AnimatePresence initial={false}>
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                itemCount={itemsByRoom.get(room.id)?.length ?? 0}
                selected={selectedRoom?.id === room.id}
                onSelect={() => setSelectedRoomId((id) => (id === room.id ? null : room.id))}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence initial={false}>
        {selectedRoom && (
          <motion.section
            key={selectedRoom.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 border-t pt-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading font-semibold">{selectedRoom.name}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={openCreateItem}>
                  <Plus className="size-3.5" /> Objeto
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label={`Opciones de ${selectedRoom.name}`}>
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingRoom(selectedRoom)
                        setRoomFormOpen(true)
                      }}
                    >
                      <Pencil /> Editar habitación
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        removeRoom.mutate(selectedRoom.id)
                        setSelectedRoomId(null)
                      }}
                    >
                      <Trash2 /> Eliminar habitación
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <EmptyState icon={ROOM_TYPE_META[selectedRoom.type].icon} message="Sin objetos en esta habitación." />
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {selectedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEdit={() => setItemDialog({ item })}
                      onRemove={() => removeItem.mutate(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <RoomFormDialog
        open={roomFormOpen}
        onOpenChange={setRoomFormOpen}
        room={editingRoom}
        onSubmit={(data) => {
          if (editingRoom) {
            updateRoom.mutate({ id: editingRoom.id, changes: data })
          } else {
            createRoom.mutate(data)
          }
        }}
      />

      {itemDialog && selectedRoom && (
        <ItemFormDialog
          open={Boolean(itemDialog)}
          onOpenChange={(open) => !open && setItemDialog(null)}
          roomId={selectedRoom.id}
          item={itemDialog.item}
          onSubmit={(data) => {
            if (itemDialog.item) {
              updateItem.mutate({ id: itemDialog.item.id, changes: data })
            } else {
              createItem.mutate(data)
            }
          }}
        />
      )}
    </div>
  )
}

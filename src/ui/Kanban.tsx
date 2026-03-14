import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  rectIntersection,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import SortableCard from './SortableCard'

function DroppableZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div 
      ref={setNodeRef} 
      className={`flex flex-col gap-4 min-h-[200px] transition-colors rounded-xl p-2 -m-2 ${
        isOver ? 'bg-[#313D4A]/50 border-2 border-dashed border-[#5A6D83]' : ''
      }`}
    >
      {children}
    </div>
  )
}

type Stage = { key: string; label: string; icon?: string }

export default function Kanban({
  stages,
  itemsByStage,
  onMove,
  onFollowUp,
}: {
  stages: readonly Stage[]
  itemsByStage: Record<string, any[]>
  onMove: (id: string, stage: string) => Promise<void>
  onFollowUp: (id: string, date: string | null, note: string | null) => Promise<void>
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeItem = useMemo(() => {
    if (!activeId) return null
    for (const items of Object.values(itemsByStage)) {
      const found = items.find(it => it.id === activeId)
      if (found) return found
    }
    return null
  }, [activeId, itemsByStage])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const containers = useMemo(() => stages.map((s) => s.key), [stages])

  const findContainer = (id: string) => {
    for (const c of containers) {
      if (itemsByStage[c]?.some((x) => x.id === id)) return c
    }
    return null
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)

    const overId = String(over.id)
    const from = findContainer(activeId)
    const to = containers.includes(overId) ? overId : findContainer(overId)

    if (!from || !to || from === to) return

    setBusyId(activeId)
    try {
      await onMove(activeId, to)
    } finally {
      setBusyId(null)
    }
  }

  const handleDragStart = (event: any) => {
    setActiveId(String(event.active.id))
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={(e) => {
        setActiveId(null)
        handleDragEnd(e)
      }}
      onDragCancel={handleDragCancel}
      collisionDetection={rectIntersection}
    >
      <div className="flex flex-wrap gap-6 pb-10">
        {stages.map((stage) => {
          const items = itemsByStage[stage.key] ?? []
          return (
            <div 
              key={stage.key} 
              className="flex w-full sm:w-[320px] flex-col gap-4 rounded-xl border-2 border-slate-300 bg-transparent px-4 pt-4 pb-6 dark:border-[#2E3A47] dark:bg-[#1A222C]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                  <span>{stage.icon}</span>
                  {stage.label}
                </h3>
                <span className={`inline-flex rounded-full py-0.5 px-2.5 text-sm font-medium ${
                  stage.key === 'new' && items.length > 0 
                    ? 'bg-[#10B981]/20 text-[#10B981]' 
                    : 'bg-primary/20 text-primary dark:bg-[#313D4A] dark:text-[#AEB7C0]'
                }`}>
                  {items.length}
                </span>
              </div>
              <DroppableZone id={stage.key}>
                <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                  {items.map((it) => (
                    <SortableCard
                      key={it.id}
                      id={it.id}
                      stage={stage.key}
                      stages={stages}
                      title={it.account_name || 'Business'}
                      subtitle={it.lead_source}
                      value={it.value_monthly}
                      followUpDate={it.next_follow_up_date}
                      followUpNote={it.next_follow_up_note}
                      disabled={busyId === it.id}
                      onFollowUp={async (date, note) => onFollowUp(it.id, date, note)}
                      onMove={onMove}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="flex items-center justify-center p-8 text-sm font-medium border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 rounded-xl bg-transparent min-h-[100px] border-spacing-4">
                      Drop here
                    </div>
                  )}
                </SortableContext>
              </DroppableZone>
            </div>
          )
        })}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeItem ? (
          <div className="w-64 rotate-3 scale-105 opacity-90">
            <SortableCard
              id={activeItem.id}
              title={activeItem.account_name || 'Opportunity'}
              value={activeItem.value_monthly}
              followUpDate={activeItem.next_follow_up_date}
              followUpNote={activeItem.next_follow_up_note}
              onFollowUp={async () => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

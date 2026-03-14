import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import SortableCard from './SortableCard'

type Stage = { key: string; label: string }

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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-6 overflow-x-auto sm:flex-row pb-6">
        {stages.map((stage) => {
          const items = itemsByStage[stage.key] ?? []
          return (
            <div key={stage.key} className="flex min-w-[280px] sm:min-w-[320px] shrink-0 flex-col gap-4 rounded-sm border border-stroke bg-gray-2 px-4 pt-4 pb-6 dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  {stage.label}
                </h3>
                <span className="inline-flex rounded-full bg-primary/20 py-0.5 px-2.5 text-sm font-medium text-primary">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-4 min-h-[100px]" id={stage.key}>
                <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                  {items.map((it) => (
                    <SortableCard
                      key={it.id}
                      id={it.id}
                      stage={stage.key}
                      stages={stages}
                      title={it.account_id ? `Account: ${it.account_id}` : (it.lead_id ? `Lead: ${it.lead_id}` : 'Opportunity')}
                      value={it.value_monthly}
                      followUpDate={it.next_follow_up_date}
                      followUpNote={it.next_follow_up_note}
                      disabled={busyId === it.id}
                      onFollowUp={async (date, note) => onFollowUp(it.id, date, note)}
                      onMove={onMove}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="flex items-center justify-center p-4 text-sm font-medium border-2 border-dashed border-stroke dark:border-strokedark text-body-color dark:text-bodydark rounded-sm bg-gray dark:bg-meta-4 min-h-[80px]">
                      Drop here
                    </div>
                  )}
                </SortableContext>
              </div>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}

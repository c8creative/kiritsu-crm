
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

    // Over can be a container id or a card id.
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
      <div className="kanban">
        {stages.map((stage) => {
          const items = itemsByStage[stage.key] ?? []
          return (
            <div key={stage.key} className="column">
              <h3>
                {stage.label} <span className="pill">{items.length}</span>
              </h3>
              <div className="card" style={{ padding: 10 }} id={stage.key}>
                <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                  {items.map((it) => (
                    <SortableCard
                      key={it.id}
                      id={it.id}
                      title={it.account_id ? `Account: ${it.account_id}` : (it.lead_id ? `Lead: ${it.lead_id}` : 'Opportunity')}
                      value={it.value_monthly}
                      followUpDate={it.next_follow_up_date}
                      followUpNote={it.next_follow_up_note}
                      disabled={busyId === it.id}
                      onFollowUp={async (date, note) => onFollowUp(it.id, date, note)}
                    />
                  ))}
                  {items.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Drop here</div>}
                </SortableContext>
              </div>
            </div>
          )
        })}
      </div>
    </DndContext>
  )
}

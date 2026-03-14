import { useEffect, useMemo, useState } from 'react'
import { listOpportunities, PIPELINE_STAGES, updateOpportunityStage, setOpportunityFollowUp } from '../lib/db'
import type { Opportunity } from '../lib/types'
import Kanban from '../ui/Kanban'

export default function PipelinePage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [err, setErr] = useState<string | null>(null)

  const refresh = async () => {
    const data = await listOpportunities()
    setItems(data)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const byStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {}
    for (const s of PIPELINE_STAGES) map[s.key] = []
    for (const it of items) (map[it.stage] ??= []).push(it)
    return map
  }, [items])

  const onMove = async (opportunityId: string, stage: string) => {
    await updateOpportunityStage(opportunityId, stage)
    await refresh()
  }

  const onFollowUp = async (id: string, date: string | null, note: string | null) => {
    await setOpportunityFollowUp(id, date, note)
    await refresh()
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Pipeline
        </h2>
        <span className="text-sm font-medium text-body-color dark:text-bodydark">
          Drag cards between stages (Desktop) or use dropdown (Mobile).
        </span>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <Kanban stages={PIPELINE_STAGES} itemsByStage={byStage} onMove={onMove} onFollowUp={onFollowUp} />
    </>
  )
}

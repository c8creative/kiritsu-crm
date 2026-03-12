
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
    <div>
      <div className="topbar">
        <div>
          <h1 className="h1">Pipeline</h1>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Drag cards between stages.</div>
        </div>
      </div>

      {err && <div style={{ color: 'var(--danger)' }}>{err}</div>}

      <Kanban stages={PIPELINE_STAGES} itemsByStage={byStage} onMove={onMove} onFollowUp={onFollowUp} />
    </div>
  )
}

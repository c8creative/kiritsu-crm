import { useEffect, useMemo, useState } from 'react'
import { listOpportunities, listConnections, PIPELINE_STAGES, updateOpportunityStage, setOpportunityFollowUp, archiveOpportunity } from '../lib/db'
import type { Opportunity, Connection } from '../lib/types'
import Kanban from '../ui/Kanban'
import { MdArchive, MdClose } from 'react-icons/md'

export default function PipelinePage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [connections, setConnections] = useState<Record<string, Connection>>({})
  const [err, setErr] = useState<string | null>(null)
  const [archivedOpen, setArchivedOpen] = useState(false)

  const refresh = async () => {
    const opps = await listOpportunities()
    const connsArr = await listConnections()
    const connMap: Record<string, Connection> = {}
    for (const c of connsArr) connMap[c.id] = c
    setConnections(connMap)
    setItems(opps)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const byStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {}
    for (const s of PIPELINE_STAGES) map[s.key] = []
    for (const it of items) {
      if (!it.archived) {
        (map[it.stage] ??= []).push(it)
      }
    }
    return map
  }, [items])

  const archivedItems = useMemo(() => items.filter(it => it.archived), [items])

  const onMove = async (opportunityId: string, stage: string) => {
    await updateOpportunityStage(opportunityId, stage)
    await refresh()
  }

  const onFollowUp = async (id: string, date: string | null, note: string | null) => {
    await setOpportunityFollowUp(id, date, note)
    await refresh()
  }

  const onArchive = async (id: string) => {
    if (!window.confirm("Archive this opportunity?")) return
    await archiveOpportunity(id, true)
    await refresh()
  }

  const onUnarchive = async (id: string) => {
    await archiveOpportunity(id, false)
    await refresh()
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Pipeline
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-sm font-medium text-body-color dark:text-bodydark hidden sm:block">
            Drag cards (Desktop) or use dropdown (Mobile).
          </span>
          <button 
            onClick={() => setArchivedOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-2 px-4 py-2 text-sm font-medium text-black dark:bg-meta-4 dark:text-white hover:bg-gray-3 dark:hover:bg-boxdark-2 transition-colors"
          >
            <MdArchive size={18} />
            Archived ({archivedItems.length})
          </button>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <Kanban stages={PIPELINE_STAGES} itemsByStage={byStage} connections={connections} onMove={onMove} onFollowUp={onFollowUp} onArchive={onArchive} />

      {archivedOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-default dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between pb-2 border-b border-stroke dark:border-strokedark">
              <h3 className="text-lg font-bold text-black dark:text-white">Archived Opportunities</h3>
              <button onClick={() => setArchivedOpen(false)} className="text-body-color hover:text-black dark:text-bodydark dark:hover:text-white hover:bg-gray-2 dark:hover:bg-meta-4 rounded-full p-1 transition-colors">
                <MdClose size={24} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {archivedItems.length === 0 ? (
                <p className="text-sm text-body-color text-center py-6">No archived items.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {archivedItems.map(it => (
                    <div key={it.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-gray-2 p-4 dark:bg-meta-4">
                      <div>
                        <h4 className="font-semibold text-black dark:text-white">{it.account_name || 'Opportunity'}</h4>
                        <p className="text-sm text-body-color mt-1">${it.value_monthly || 0}/mo — {it.stage}</p>
                      </div>
                      <button 
                        onClick={() => onUnarchive(it.id)}
                        className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-colors"
                      >
                        Unarchive
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

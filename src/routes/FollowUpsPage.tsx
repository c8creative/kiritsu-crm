import { useEffect, useMemo, useState } from 'react'
import { format, isBefore, isEqual, parseISO, startOfDay } from 'date-fns'
import { listFollowUps, PIPELINE_STAGES } from '../lib/db'
import type { Opportunity } from '../lib/types'

export default function FollowUpsPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listFollowUps().then(setItems).catch((e) => setErr(e.message))
  }, [])

  const today = startOfDay(new Date())

  const enriched = useMemo(() => {
    const stageLabel = (k: string) => PIPELINE_STAGES.find((s) => s.key === k)?.label ?? k
    return items.map((o) => {
      const d = o.next_follow_up_date ? parseISO(o.next_follow_up_date) : null
      const overdue = d ? isBefore(d, today) : false
      const dueToday = d ? isEqual(startOfDay(d), today) : false
      return { ...o, stageLabel: stageLabel(o.stage), overdue, dueToday }
    })
  }, [items])

  const overdue = enriched.filter((x: any) => x.overdue)
  const dueToday = enriched.filter((x: any) => x.dueToday)
  const upcoming = enriched.filter((x: any) => !x.overdue && !x.dueToday)

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Follow-ups
          </h2>
          <div className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            Overdue → Today → Upcoming
          </div>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Overdue</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Stage</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Follow-up</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white hidden sm:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((o: any, key: number) => (
                    <tr key={o.id} className={key === overdue.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-5 px-4 text-black dark:text-white">{o.stageLabel}</td>
                      <td className="py-5 px-4 text-meta-1 font-medium">{o.next_follow_up_date}</td>
                      <td className="py-5 px-4 text-body-color dark:text-bodydark hidden sm:table-cell">{o.next_follow_up_note ?? '—'}</td>
                    </tr>
                  ))}
                  {overdue.length === 0 && (
                    <tr><td colSpan={3} className="py-5 px-4 text-body-color dark:text-bodydark">None</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Due today</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Stage</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Follow-up</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white hidden sm:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {dueToday.map((o: any, key: number) => (
                    <tr key={o.id} className={key === dueToday.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-5 px-4 text-black dark:text-white">{o.stageLabel}</td>
                      <td className="py-5 px-4 text-meta-3 font-medium">{o.next_follow_up_date}</td>
                      <td className="py-5 px-4 text-body-color dark:text-bodydark hidden sm:table-cell">{o.next_follow_up_note ?? '—'}</td>
                    </tr>
                  ))}
                  {dueToday.length === 0 && (
                    <tr><td colSpan={3} className="py-5 px-4 text-body-color dark:text-bodydark">None</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Upcoming</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Stage</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">Follow-up</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white hidden sm:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((o: any, key: number) => (
                    <tr key={o.id} className={key === upcoming.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-5 px-4 text-black dark:text-white">{o.stageLabel}</td>
                      <td className="py-5 px-4 text-black dark:text-white">{o.next_follow_up_date ? format(parseISO(o.next_follow_up_date), 'yyyy-MM-dd') : '—'}</td>
                      <td className="py-5 px-4 text-body-color dark:text-bodydark hidden sm:table-cell">{o.next_follow_up_note ?? '—'}</td>
                    </tr>
                  ))}
                  {upcoming.length === 0 && (
                    <tr><td colSpan={3} className="py-5 px-4 text-body-color dark:text-bodydark">None</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

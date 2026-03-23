import { useEffect, useMemo, useState } from 'react'
import { format, isBefore, isEqual, parseISO, startOfDay } from 'date-fns'
import { listOpportunities, PIPELINE_STAGES } from '../lib/db'
import { auth } from '../lib/firebase'
import type { Opportunity } from '../lib/types'
import { MdOutlineSchedule, MdOutlineStar } from 'react-icons/md'

export default function DashboardPage() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'followups' | 'newleads'>('followups')

  useEffect(() => {
    listOpportunities().then(setItems).catch((e) => setErr(e.message))
  }, [])

  const today = startOfDay(new Date())

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const name = auth.currentUser?.displayName || 'there'
    if (hour < 12) return `Good morning, ${name}!`
    if (hour < 18) return `Good afternoon, ${name}!`
    return `Good evening, ${name}!`
  }, [])

  const enriched = useMemo(() => {
    const stageLabel = (k: string) => PIPELINE_STAGES.find((s) => s.key === k)?.label ?? k
    return items.map((o) => {
      const d = o.next_follow_up_date ? parseISO(o.next_follow_up_date) : null
      const overdue = d ? isBefore(d, today) : false
      const dueToday = d ? isEqual(startOfDay(d), today) : false
      const isNew = o.stage === 'new'
      return { ...o, stageLabel: stageLabel(o.stage), overdue, dueToday, isNew }
    })
  }, [items])

  const overdue = enriched.filter((x: any) => x.overdue)
  const dueToday = enriched.filter((x: any) => x.dueToday)
  const upcoming = enriched.filter((x: any) => !x.overdue && !x.dueToday && x.next_follow_up_date)
  const newLeads = enriched.filter((x: any) => x.isNew)

  return (
    <div className="mx-auto max-w-7xl">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {greeting}
        </h1>
        <p className="mt-2 text-body-color dark:text-bodydark">
          Here is what is happening with your pipeline today.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-4 border-b border-stroke dark:border-strokedark">
        <button
          onClick={() => setActiveTab('followups')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === 'followups'
              ? 'border-b-2 border-primary text-primary dark:text-white'
              : 'text-body-color hover:text-primary dark:text-bodydark'
          }`}
        >
          <MdOutlineSchedule size={20} className={activeTab === 'followups' ? 'text-primary dark:text-white' : ''} />
          Follow-ups
          {(overdue.length + dueToday.length) > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] text-white">
              {overdue.length + dueToday.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('newleads')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === 'newleads'
              ? 'border-b-2 border-primary text-primary dark:text-white'
              : 'text-body-color hover:text-primary dark:text-bodydark'
          }`}
        >
          <MdOutlineStar size={20} className={activeTab === 'newleads' ? 'text-primary dark:text-white' : ''} />
          New Leads
          {newLeads.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-[10px] text-white">
              {newLeads.length}
            </span>
          )}
        </button>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      {activeTab === 'followups' ? (
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          {/* Overdue column */}
          <div className="flex flex-col gap-9">
            <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-bold text-black dark:text-white">Overdue</h4>
                  {overdue.length > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-danger px-2 text-xs font-bold text-white shadow-sm">
                      {overdue.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4 text-[13px]">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Company</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Due/Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                     {overdue.map((o: any) => (
                      <tr key={o.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                        <td className="py-5 px-4 text-black dark:text-white font-medium">—</td>
                        <td className="py-5 px-4 text-black dark:text-white font-medium">{o.account_name}</td>
                        <td className="py-5 px-4 text-danger font-medium">{o.next_follow_up_date}</td>
                      </tr>
                    ))}
                    {overdue.length === 0 && (
                      <tr><td colSpan={3} className="py-10 text-center text-slate-400 italic">No overdue follow-ups. Great job!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Today & Upcoming column */}
          <div className="flex flex-col gap-9">
            <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-bold text-black dark:text-white">Due Today</h4>
                  {dueToday.length > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-warning px-2 text-xs font-bold text-black shadow-sm">
                      {dueToday.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4 text-[13px]">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Company</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                     {dueToday.map((o: any) => (
                      <tr key={o.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                        <td className="py-5 px-4 text-black dark:text-white font-medium">—</td>
                        <td className="py-5 px-4 text-black dark:text-white font-medium">{o.account_name}</td>
                        <td className="py-5 px-4 text-warning font-medium">Today</td>
                      </tr>
                    ))}
                     {dueToday.length === 0 && (
                      <tr><td colSpan={3} className="py-10 text-center text-slate-400 italic">Nothing scheduled for today.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
              <h4 className="mb-6 text-xl font-bold text-black dark:text-white">Upcoming</h4>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4 text-[13px]">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Company</th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                     {upcoming.map((o: any) => (
                      <tr key={o.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                        <td className="py-5 px-4 text-black dark:text-white font-medium">—</td>
                        <td className="py-5 px-4 text-black dark:text-white font-medium">{o.account_name}</td>
                        <td className="py-5 px-4 text-body-color dark:text-bodydark">
                          {format(parseISO(o.next_follow_up_date), 'MMM d')}
                        </td>
                      </tr>
                    ))}
                     {upcoming.length === 0 && (
                      <tr><td colSpan={3} className="py-10 text-center text-slate-400 italic">No upcoming follow-ups.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* New Leads Tab Content */
        <div className="rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-bold text-black dark:text-white">Fresh Opportunities</h4>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto mb-4">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4 text-[13px]">
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Company</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Source</th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Created</th>
                </tr>
              </thead>
              <tbody>
                {newLeads.map((o: any) => (
                   <tr key={o.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                    <td className="py-5 px-4 text-black dark:text-white font-medium">—</td>
                    <td className="py-5 px-4 text-black dark:text-white font-medium">{o.account_name}</td>
                    <td className="py-5 px-4 text-body-color dark:text-bodydark">
                        <span className="rounded-full bg-primary/10 dark:bg-primary/20 px-2 py-0.5 text-xs text-primary dark:text-blue-300">
                            {o.lead_source || 'Unknown'}
                        </span>
                    </td>
                    <td className="py-5 px-4 text-body-color dark:text-bodydark">
                      {format(new Date(o.created_at), 'MMM d')}
                    </td>
                  </tr>
                ))}
                 {newLeads.length === 0 && (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No new leads. Time to find some prospects!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

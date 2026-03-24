import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import { createJob, createVisit } from '../lib/db'
import type { Connection } from '../lib/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  connections: Connection[]
}

export default function AddJobModal({ isOpen, onClose, onSuccess, connections }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [scheduleVisit, setScheduleVisit] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    try {
      const connection_id = String(fd.get('connection_id') || '')
      const frequency = String(fd.get('frequency') || 'weekly')
      const price_per_visit = fd.get('price_per_visit') ? Number(fd.get('price_per_visit')) : null
      const start_date = String(fd.get('start_date') || '') || null
      const notes = String(fd.get('notes') || '').trim() || null

      const newJob = await createJob({
        connection_id,
        location_id: null,
        frequency,
        day_of_week: fd.get('day_of_week') ? Number(fd.get('day_of_week')) : null,
        start_date,
        active: true,
        price_per_visit,
        notes,
      } as any)

      // Initial visit handling
      const visitDate = String(fd.get('visitDate') || '') || null
      if (scheduleVisit && visitDate) {
        await createVisit(newJob.id, visitDate)
      }

      onSuccess()
      onClose()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-boxdark animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 dark:border-strokedark dark:bg-boxdark">
          <h3 className="text-xl font-semibold text-black dark:text-white">Create New Job</h3>
          <button type="button" onClick={onClose} className="text-body-color hover:text-danger">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {err && <div className="mb-4 text-meta-1 text-sm">{err}</div>}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Connection <span className="text-meta-1">*</span></label>
              <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="connection_id" required>
                <option value="">Select a Connection...</option>
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Frequency</label>
              <select className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="frequency" defaultValue="weekly">
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Price Per Visit ($)</label>
              <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="price_per_visit" type="number" step="0.01" placeholder="150.00" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Day of week (0=Sun)</label>
              <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="day_of_week" type="number" min={0} max={6} placeholder="1" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Start Date</label>
              <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" type="date" name="start_date" />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Job Notes & Details</label>
              <textarea name="notes" rows={3} className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="Specific requirements, property details..."></textarea>
            </div>

            <div className="md:col-span-2 border-t border-stroke pt-4 dark:border-strokedark mt-2">
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="checkbox" 
                    checked={scheduleVisit}
                    onChange={(e) => setScheduleVisit(e.target.checked)}
                    name="scheduleVisit" 
                    id="scheduleVisit" 
                    className="w-4 h-4 cursor-pointer accent-primary" 
                  />
                  <label htmlFor="scheduleVisit" className="text-sm font-semibold text-black dark:text-white cursor-pointer select-none">
                     Schedule Initial Visit Now
                  </label>
                </div>
            </div>

            {scheduleVisit && (
              <div className="md:col-span-2 animate-fade-in">
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">Initial Visit Date <span className="text-meta-1">*</span></label>
                <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" type="date" name="visitDate" required={scheduleVisit} />
              </div>
            )}

          </div>

          <div className="mt-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-stroke py-3 font-medium text-black hover:bg-gray transition dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex-[1.5] rounded-lg bg-primary py-3 font-medium text-white shadow-md hover:bg-opacity-90 disabled:bg-opacity-50 transition">
              {busy ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addActivity, addContact, addLocation, getAccount } from '../lib/db'

export default function AccountDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    if (!id) return
    const d = await getAccount(id)
    setData(d)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [id])

  if (!id) return null
  if (!data) return <div className="p-6">Loading…</div>

  const { account, contacts, locations, opps, activities, jobs } = data
  const primaryOpp = opps?.[0]?.id ?? null

  const onAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addContact(id, {
        name: String(fd.get('name') || ''),
        role: String(fd.get('role') || ''),
        phone: String(fd.get('phone') || ''),
        email: String(fd.get('email') || ''),
      })
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addLocation(id, {
        label: String(fd.get('label') || ''),
        address1: String(fd.get('address1') || ''),
        city: String(fd.get('city') || ''),
        state: String(fd.get('state') || ''),
        zip: String(fd.get('zip') || ''),
        notes: String(fd.get('notes') || ''),
      } as any)
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    setBusy(true)
    try {
      await addActivity(id, primaryOpp, {
        activity_type: 'note',
        summary: String(fd.get('summary') || 'Note'),
        details: String(fd.get('details') || ''),
      })
      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {account.name}
          </h2>
        </div>
        <div>
          <span className="inline-flex rounded-full bg-success/10 py-1 px-3 text-sm font-medium text-success">
            {account.status}
          </span>
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="grid grid-cols-1 gap-9 mt-4 lg:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Timeline</h4>
            <form onSubmit={onAddNote} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">Summary</label>
                <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="summary" placeholder="Spoke with GM…" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">Details</label>
                <textarea className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="details" rows={3} placeholder="What happened / next step" />
              </div>
              <button className="flex w-full justify-center rounded bg-primary py-3 font-medium text-gray hover:bg-opacity-90" disabled={busy}>Add note</button>
            </form>

            <div className="mt-8 flex flex-col gap-4">
              {(activities ?? []).map((a: any) => (
                <div key={a.id} className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                  <strong className="block font-medium text-black dark:text-white">{a.summary || a.activity_type}</strong>
                  <div className="text-xs text-body-color dark:text-bodydark mt-1">{new Date(a.occurred_at).toLocaleString()}</div>
                  {a.details && <div className="mt-3 text-sm text-black dark:text-white">{a.details}</div>}
                </div>
              ))}
              {(activities ?? []).length === 0 && <div className="text-body-color dark:text-bodydark pb-4">No activity yet.</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Contacts</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Name</th>
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Role</th>
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {(contacts ?? []).map((c: any, key: number) => (
                    <tr key={c.id} className={key === contacts.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-3 px-4 text-black dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-black dark:text-white">{c.role ?? '—'}</td>
                      <td className="py-3 px-4 text-body-color dark:text-bodydark">{c.email || c.phone || '—'}</td>
                    </tr>
                  ))}
                  {(contacts ?? []).length === 0 && <tr><td colSpan={3} className="py-3 px-4 text-body-color dark:text-bodydark">No contacts yet.</td></tr>}
                </tbody>
              </table>
            </div>

            <form onSubmit={onAddContact} className="mt-4 flex flex-col gap-4 border-t border-stroke pt-4 dark:border-strokedark">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Name</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="name" required />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Role</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="role" placeholder="Owner / GM" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Phone</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="phone" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Email</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="email" />
                </div>
              </div>
              <button className="flex w-full justify-center rounded border border-stroke bg-transparent py-3 font-medium hover:bg-gray transition dark:border-strokedark dark:hover:bg-meta-4" disabled={busy}>Add contact</button>
            </form>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Locations</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Label</th>
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {(locations ?? []).map((l: any, key: number) => (
                    <tr key={l.id} className={key === locations.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-3 px-4 text-black dark:text-white">{l.label || '—'}</td>
                      <td className="py-3 px-4 text-body-color dark:text-bodydark">{[l.address1, l.city, l.state, l.zip].filter(Boolean).join(', ') || '—'}</td>
                    </tr>
                  ))}
                  {(locations ?? []).length === 0 && <tr><td colSpan={2} className="py-3 px-4 text-body-color dark:text-bodydark">No locations yet.</td></tr>}
                </tbody>
              </table>
            </div>

            <form onSubmit={onAddLocation} className="mt-4 flex flex-col gap-4 border-t border-stroke pt-4 dark:border-strokedark">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Label</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="label" placeholder="Downtown" />
                </div>
                <div className="sm:w-2/3">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">Address</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="address1" placeholder="123 King St" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">City</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="city" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">State</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="state" defaultValue="VA" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">ZIP</label>
                  <input className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="zip" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">Notes</label>
                <textarea className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" name="notes" rows={2} placeholder="Glass notes / access" />
              </div>
              <button className="flex w-full justify-center rounded border border-stroke bg-transparent py-3 font-medium hover:bg-gray transition dark:border-strokedark dark:hover:bg-meta-4" disabled={busy}>Add location</button>
            </form>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h4 className="border-b border-stroke pb-3 text-xl font-semibold text-black dark:text-white dark:border-strokedark">Jobs</h4>
            <div className="mt-2 text-sm text-body-color dark:text-bodydark">
              Jobs are managed from the Jobs page (link in sidebar).
            </div>
            <div className="max-w-full overflow-x-auto mt-4">
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Frequency</th>
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Price/Visit</th>
                    <th className="py-2 px-4 font-medium text-black dark:text-white">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {(jobs ?? []).slice(0,5).map((j: any, key: number) => (
                    <tr key={j.id} className={key === jobs.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                      <td className="py-3 px-4 text-black dark:text-white">{j.frequency}</td>
                      <td className="py-3 px-4 text-body-color dark:text-bodydark">{j.price_per_visit ?? '—'}</td>
                      <td className="py-3 px-4 text-body-color dark:text-bodydark">{j.active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                  {(jobs ?? []).length === 0 && <tr><td colSpan={3} className="py-3 px-4 text-body-color dark:text-bodydark">No jobs yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

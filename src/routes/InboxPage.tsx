import { useEffect, useMemo, useState } from 'react'
import { createLead, convertLeadToAccount, listLeads } from '../lib/db'
import type { Lead } from '../lib/types'
import CsvImport from '../ui/CsvImport'

type LeadSource = 'door' | 'website' | 'referral' | 'other'

export default function InboxPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const refresh = async () => {
    setErr(null)
    const data = await listLeads()
    setLeads(data)
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message))
  }, [])

  const newLeads = useMemo(
    () => leads.filter((l) => l.status === 'new'),
    [leads],
  )

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    const source = (String(fd.get('source') || 'door') as LeadSource) ?? 'door'
    const name = String(fd.get('name') || '').trim()
    const phoneRaw = String(fd.get('phone') || '').trim()
    const emailRaw = String(fd.get('email') || '').trim()
    const addressRaw = String(fd.get('address_text') || '').trim()

    if (!name) {
      setErr('Business name is required.')
      return
    }

    setBusy(true)
    try {
      await createLead({
        source,
        name,
        phone: phoneRaw.length ? phoneRaw : null,
        email: emailRaw.length ? emailRaw : null,
        address_text: addressRaw.length ? addressRaw : null,
        status: 'new',
      } as any)

      form.reset()
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create lead')
    } finally {
      setBusy(false)
    }
  }

  const onConvert = async (leadId: string) => {
    setErr(null)
    setBusy(true)
    try {
      await convertLeadToAccount(leadId)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to convert lead')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Inbox
        </h2>
        <span className="inline-flex rounded-full bg-primary/10 py-1 px-3 text-sm font-medium text-primary">
          New leads: {newLeads.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-9 mt-4 lg:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Add lead
              </h3>
            </div>
            <form onSubmit={onCreate} className="p-6.5 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/3">
                  <label className="mb-2.5 block text-black dark:text-white">Source</label>
                  <select name="source" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" defaultValue="door">
                    <option value="door">Door / Walk-in</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="w-full sm:w-2/3">
                  <label className="mb-2.5 block text-black dark:text-white">Business name</label>
                  <input
                    name="name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="Restaurant / Business"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Phone</label>
                  <input name="phone" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="703-555-1234" />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Email</label>
                  <input name="email" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="gm@restaurant.com" />
                </div>
              </div>

              <div>
                <label className="mb-2.5 block text-black dark:text-white">Address / Notes</label>
                <textarea
                  name="address_text"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  rows={3}
                  placeholder="Address or quick notes"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                <button className="flex w-full sm:w-auto justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90" disabled={busy}>
                  {busy ? 'Adding…' : 'Add Lead'}
                </button>
                <span className="text-sm text-body-color dark:text-bodydark flex-1">
                  Convert a lead to create an Account + Opportunity.
                </span>
              </div>
            </form>

            {err && (
              <div className="px-6.5 pb-6 text-meta-1">
                {err}
              </div>
            )}
            <div className="px-6.5 pb-6">
              <CsvImport onImported={refresh} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
              New leads
            </h4>

            <div className="flex flex-col">
              <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
                <div className="p-2.5 xl:p-5">
                  <h5 className="text-sm font-medium uppercase xsm:text-base">Name</h5>
                </div>
                <div className="p-2.5 text-center xl:p-5">
                  <h5 className="text-sm font-medium uppercase xsm:text-base">Source</h5>
                </div>
                <div className="p-2.5 text-center xl:p-5">
                  <h5 className="text-sm font-medium uppercase xsm:text-base">Contact</h5>
                </div>
                <div className="hidden p-2.5 text-center sm:block xl:p-5">
                  <h5 className="text-sm font-medium uppercase xsm:text-base">Action</h5>
                </div>
              </div>

              {newLeads.map((l, key) => (
                <div
                  className={`grid grid-cols-4 sm:grid-cols-4 ${
                    key === newLeads.length - 1
                      ? ''
                      : 'border-b border-stroke dark:border-strokedark'
                  }`}
                  key={l.id}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="hidden text-black dark:text-white sm:block">
                      {l.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">{l.source}</p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-meta-3 truncate max-w-full text-xs sm:text-base">{l.email || l.phone || '—'}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <button
                      className="flex justify-center rounded bg-primary py-1 px-3 text-sm font-medium text-gray hover:bg-opacity-90"
                      onClick={() => onConvert(l.id)}
                      disabled={busy}
                    >
                      Convert
                    </button>
                  </div>
                </div>
              ))}

              {newLeads.length === 0 && (
                <div className="p-5 text-center text-body-color dark:text-bodydark">
                  No new leads.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
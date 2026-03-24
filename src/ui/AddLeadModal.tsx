import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import { createLead } from '../lib/db'
import type { Lead } from '../lib/types'

type LeadSource = 'door' | 'website' | 'referral' | 'other'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddLeadModal({ isOpen, onClose, onSuccess }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [leadName, setLeadName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    const source = (String(fd.get('source') || 'door') as LeadSource) ?? 'door'
    const name = String(fd.get('name') || '').trim()
    const phoneRaw = String(fd.get('phone') || '').trim()
    const emailRaw = String(fd.get('email') || '').trim()
    const addressRaw = String(fd.get('address_text') || '').trim()

    if (!name && !firstName.trim() && !lastName.trim()) {
      setErr('First, Last, or Business name is required.')
      setBusy(false)
      return
    }

    try {
      await createLead({
        source,
        firstName: firstName.trim().length ? firstName.trim() : null,
        lastName: lastName.trim().length ? lastName.trim() : null,
        name,
        phone: phoneRaw.length ? phoneRaw : null,
        email: emailRaw.length ? emailRaw : null,
        address_text: addressRaw.length ? addressRaw : null,
        status: 'new',
      } as any)

      setLeadName('')
      setFirstName('')
      setLastName('')
      form.reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to add lead')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-boxdark">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 dark:border-strokedark dark:bg-boxdark">
          <h3 className="text-xl font-bold text-black dark:text-white">Add New Lead</h3>
          <button
            onClick={onClose}
            className="text-body-color hover:text-black dark:text-bodydark dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-2 dark:hover:bg-meta-4"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-1/3">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Source</label>
              <select name="source" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" defaultValue="door">
                <option value="door">Door / Walk-in</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="w-full sm:w-2/3">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Business name</label>
              <input
                name="name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                placeholder="Restaurant / Business"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">First Name</label>
              <input
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                placeholder="John"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Last Name</label>
              <input
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Phone</label>
              <input name="phone" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="703-555-1234" />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Email</label>
              <input
                name="email"
                type="email"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" 
                placeholder="gm@restaurant.com" 
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">Address / Notes</label>
            <textarea
              name="address_text"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              rows={3}
              placeholder="Address or quick notes"
            />
          </div>

          {err && (
            <div className="rounded border-l-4 border-meta-1 bg-meta-1/10 p-3 text-meta-1">
              {err}
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm text-body-color dark:text-bodydark hidden sm:block">
              Convert a lead to create a Connection + Opportunity.
            </span>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded border-[1.5px] border-stroke py-2.5 px-6 font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4 transition-colors"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-primary py-2.5 px-8 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                disabled={busy || (!leadName.trim() && !firstName.trim() && !lastName.trim())}
              >
                {busy ? 'Adding...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { MdClose } from 'react-icons/md'
import { createConnection } from '../lib/db'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddConnectionModal({ isOpen, onClose, onSuccess }: Props) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)

    const form = e.target as HTMLFormElement
    const fd = new FormData(form)

    try {
      await createConnection({
        firstName: String(fd.get('firstName') || '').trim() || null,
        lastName: String(fd.get('lastName') || '').trim() || null,
        email: String(fd.get('email') || '').trim() || null,
        phone: String(fd.get('phone') || '').trim() || null,
        mobile: String(fd.get('mobile') || '').trim() || null,
        title: String(fd.get('title') || '').trim() || null,
        company: String(fd.get('company') || '').trim() || null,
        website: String(fd.get('website') || '').trim() || null,
        street: String(fd.get('street') || '').trim() || null,
        city: String(fd.get('city') || '').trim() || null,
        state: String(fd.get('state') || '').trim() || null,
        postalCode: String(fd.get('postalCode') || '').trim() || null,
        country: String(fd.get('country') || '').trim() || null,
        timeZone: String(fd.get('timeZone') || '').trim() || null,
        notes: String(fd.get('notes') || '').trim() || null,
        status: 'prospect',
      })
      onSuccess()
      onClose()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-boxdark">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 dark:border-strokedark dark:bg-boxdark">
          <h3 className="text-xl font-semibold text-black dark:text-white">Add New Connection</h3>
          <button onClick={onClose} className="text-body-color hover:text-danger">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {err && <div className="mb-4 text-meta-1 text-sm">{err}</div>}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">First Name</label>
              <input name="firstName" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Last Name</label>
              <input name="lastName" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Email</label>
              <input name="email" type="email" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Phone</label>
              <input name="phone" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Mobile</label>
              <input name="mobile" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Title</label>
              <input name="title" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="CEO / Manager" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Company</label>
              <input name="company" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Website</label>
              <input name="website" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="example.com" />
            </div>
            
            <div className="md:col-span-2 border-t border-stroke pt-4 dark:border-strokedark mt-2">
                <h4 className="font-medium text-black dark:text-white mb-4">Location Info</h4>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Street Address</label>
              <input name="street" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">City</label>
              <input name="city" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">State / Province</label>
              <input name="state" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Postal Code</label>
              <input name="postalCode" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Country</label>
              <input name="country" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" defaultValue="USA" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Time Zone</label>
              <input name="timeZone" className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="EST / GMT-5" />
            </div>

            <div className="md:col-span-2 mt-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Notes</label>
              <textarea name="notes" rows={3} className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2.5 px-4 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" placeholder="Additional details..."></textarea>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-stroke py-3 font-medium text-black hover:bg-gray transition dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-80">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="flex-1 rounded-lg bg-primary py-3 font-medium text-white shadow-md hover:bg-opacity-90 disabled:bg-opacity-50 transition">
              {busy ? 'Saving...' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

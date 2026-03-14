import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAccounts } from '../lib/db'
import type { Account } from '../lib/types'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    listAccounts().then(setAccounts).catch((e) => setErr(e.message))
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return accounts
    return accounts.filter((a) => a.name.toLowerCase().includes(s))
  }, [accounts, q])

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Accounts
          </h2>
          <div className="text-sm font-medium text-body-color dark:text-bodydark mt-1">
            Customers + prospects
          </div>
        </div>
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <input
            type="text"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
          />
        </div>
      </div>

      {err && <div className="mb-4 text-meta-1">{err}</div>}

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Industry
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, key) => (
                <tr key={a.id} className={key === filtered.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'}>
                  <td className="py-5 px-4 xl:pl-11">
                    <Link to={`/accounts/${a.id}`} className="text-primary hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="py-5 px-4">
                    <p className="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium bg-success text-success">
                      {a.status}
                    </p>
                  </td>
                  <td className="py-5 px-4">
                    <p className="text-black dark:text-white">{a.industry ?? '—'}</p>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-5 px-4 xl:pl-11 text-body-color dark:text-bodydark">
                    No accounts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { MdMoreVert, MdOutlineArchive, MdOutlineCalendarToday } from 'react-icons/md'

type Stage = { key: string; label: string; icon?: string }

export default function SortableCard({
  id,
  stage,
  stages,
  title,
  subtitle,
  source,
  updatedAt,
  followUpDate,
  followUpNote,
  disabled,
  onFollowUp,
  onMove,
  onArchive,
}: {
  id: string
  stage?: string
  stages?: readonly Stage[]
  title: string
  subtitle?: string | null
  source?: string | null
  updatedAt?: string | null
  followUpDate: string | null
  followUpNote: string | null
  disabled?: boolean
  onFollowUp: (date: string | null, note: string | null) => Promise<void>
  onMove?: (id: string, stage: string) => Promise<void>
  onArchive?: () => Promise<void>
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: disabled ? 0.6 : 1,
  }

  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [date, setDate] = useState<string>(followUpDate ?? '')
  const [note, setNote] = useState<string>(followUpNote ?? '')

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className="rounded-lg border-2 border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-400 dark:border-[#2E3A47] dark:bg-[#24303F] relative z-10"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-medium text-black dark:text-white leading-tight">{title}</h4>
          {subtitle && (
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            className="p-1.5 text-body-color hover:text-black dark:text-bodydark dark:hover:text-white rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
              setEditing(false)
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MdMoreVert size={20} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                }}
                onPointerDown={(e) => e.stopPropagation()}
              />
              <div 
                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border border-stroke bg-white py-1 shadow-default dark:border-strokedark dark:bg-boxdark"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-2 dark:hover:bg-meta-4 hover:text-primary transition-colors text-black dark:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    setEditing(true)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <MdOutlineCalendarToday size={16} /> Set Follow-up
                </button>
                {onArchive && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left hover:bg-meta-1/10 text-meta-1 transition-colors"
                    onClick={async (e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      await onArchive()
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <MdOutlineArchive size={16} /> Archive
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="text-xs font-medium text-body-color dark:text-bodydark mb-4 flex items-center justify-between">
        <span title="Source" className="bg-gray-2 dark:bg-meta-4 px-2 py-0.5 rounded capitalize">
          {source && source !== 'Unknown' ? source : 'No Source'}
        </span>
        <span title="Date Last Updated" className="opacity-60">
          {updatedAt ? new Date(updatedAt).toLocaleDateString() : '—'}
        </span>
      </div>

      <div className="flex flex-col gap-2 relative z-50">
        {/* Status Dropdown */}
        {stages && onMove && stage && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-body-color dark:text-bodydark">Status</label>
            <select
              className="w-full rounded border-2 border-slate-300 bg-white py-1.5 px-3 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-slate-600 dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={stage}
              onChange={(e) => {
                e.stopPropagation()
                onMove(id, e.target.value)
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {stages.map(s => (
                <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="mt-4 pt-4 border-t border-stroke dark:border-strokedark"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="mb-2">
            <label className="mb-2.5 block text-xs font-medium text-black dark:text-white">Next follow-up</label>
            <input
              className="w-full rounded border-2 border-slate-300 bg-white py-2 px-3 text-sm outline-none transition focus:border-primary active:border-primary dark:border-slate-600 dark:bg-form-input dark:text-white dark:focus:border-primary"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2.5 block text-xs font-medium text-black dark:text-white">Note</label>
            <input
              className="w-full rounded border-2 border-slate-300 bg-white py-2 px-3 text-sm outline-none transition focus:border-primary active:border-primary dark:border-slate-600 dark:bg-form-input dark:text-white dark:focus:border-primary"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Call GM, drop by, etc."
            />
          </div>
          <div className="flex gap-2">
            <button
              className="flex flex-1 justify-center rounded border-2 border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-meta-4"
              type="button"
              onClick={async (e) => {
                e.stopPropagation()
                setEditing(false)
                setDate(followUpDate ?? '')
                setNote(followUpNote ?? '')
              }}
            >
              Cancel
            </button>
            <button
              className="flex flex-1 justify-center rounded bg-primary py-2 text-sm font-medium text-white hover:bg-opacity-90"
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                await onFollowUp(date || null, note || null)
                setEditing(false)
              }}
            >
              Save
            </button>
            <button
              className="flex flex-1 justify-center rounded border-2 border-meta-1/20 bg-meta-1/10 text-meta-1 py-2 text-sm font-medium hover:bg-meta-1 hover:text-white transition-colors"
              type="button"
              title="Clear Follow-up"
              onClick={async (e) => {
                e.stopPropagation();
                await onFollowUp(null, null)
                setDate('')
                setNote('')
                setEditing(false)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

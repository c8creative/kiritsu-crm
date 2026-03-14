import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

type Stage = { key: string; label: string; icon?: string }

export default function SortableCard({
  id,
  stage,
  stages,
  title,
  subtitle,
  value,
  followUpDate,
  followUpNote,
  disabled,
  onFollowUp,
  onMove,
}: {
  id: string
  stage?: string
  stages?: readonly Stage[]
  title: string
  subtitle?: string | null
  value: number | null
  followUpDate: string | null
  followUpNote: string | null
  disabled?: boolean
  onFollowUp: (date: string | null, note: string | null) => Promise<void>
  onMove?: (id: string, stage: string) => Promise<void>
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: disabled ? 0.6 : 1,
  }

  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState<string>(followUpDate ?? '')
  const [note, setNote] = useState<string>(followUpNote ?? '')

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className="rounded-sm border-2 border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-400 dark:border-[#2E3A47] dark:bg-[#24303F] relative z-10"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-medium text-black dark:text-white leading-tight">{title}</h4>
          {subtitle && (
            <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="hidden sm:flex cursor-move p-1.5 text-body-color hover:text-black dark:hover:text-white hover:bg-gray-2 dark:hover:bg-boxdark-2 rounded-sm transition-colors"
          {...attributes}
          {...listeners}
          title="Drag to move"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 4h2v2H5V4zm4 0h2v2H9V4zM5 7h2v2H5V7zm4 0h2v2H9V7zm-4 3h2v2H5v-2zm4 0h2v2H9v-2z" />
          </svg>
        </div>
      </div>
      <div className="text-xs font-medium text-body-color dark:text-bodydark mb-4 flex items-center gap-3">
        <span>{value != null ? `$${value}/mo` : '—'}</span>
        <span className="opacity-60">{followUpDate ?? '—'}</span>
      </div>

      <div className="flex flex-col gap-2 relative z-50">
        <button
          className="flex w-full justify-center rounded border-2 border-slate-300 py-1.5 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-meta-4 transition-colors"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setEditing((v) => !v)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {editing ? 'Cancel' : 'Set Follow-up'}
        </button>

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
              className="flex flex-1 justify-center rounded border-2 border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-meta-4"
              type="button"
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

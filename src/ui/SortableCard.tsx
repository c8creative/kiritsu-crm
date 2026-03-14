import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

type Stage = { key: string; label: string }

export default function SortableCard({
  id,
  stage,
  stages,
  title,
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
      className="rounded-sm border border-stroke bg-white p-4 shadow-default transition hover:shadow-2 dark:border-strokedark dark:bg-boxdark relative z-10 touch-manipulation"
      {...attributes}
      {...listeners}
    >
      <h4 className="font-medium text-black dark:text-white mb-2">{title}</h4>
      <div className="text-xs font-medium text-body-color dark:text-bodydark mb-4">
        {value != null ? `$${value}/mo` : '—'} • Follow-up: {followUpDate ?? '—'}
      </div>

      <div className="flex flex-col gap-2 relative z-50">
        <button
          className="flex w-full justify-center rounded border border-stroke py-1.5 px-3 text-sm font-medium hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setEditing((v) => !v)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {editing ? 'Cancel' : 'Follow-up'}
        </button>

        {/* Mobile Stage Select */}
        {stages && onMove && stage && (
          <select
            className="sm:hidden w-full rounded border border-stroke bg-transparent py-1.5 px-3 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:focus:border-primary"
            value={stage}
            onChange={(e) => {
              e.stopPropagation()
              onMove(id, e.target.value)
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {stages.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
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
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-sm outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:focus:border-primary"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2.5 block text-xs font-medium text-black dark:text-white">Note</label>
            <input
              className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-sm outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:focus:border-primary"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              className="flex flex-1 justify-center rounded border border-stroke py-2 text-sm font-medium hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
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

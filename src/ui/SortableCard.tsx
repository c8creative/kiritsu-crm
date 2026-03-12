
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

export default function SortableCard({
  id,
  title,
  value,
  followUpDate,
  followUpNote,
  disabled,
  onFollowUp,
}: {
  id: string
  title: string
  value: number | null
  followUpDate: string | null
  followUpNote: string | null
  disabled?: boolean
  onFollowUp: (date: string | null, note: string | null) => Promise<void>
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
    <div ref={setNodeRef} style={style as any} className="cardItem" {...attributes} {...listeners}>
      <strong>{title}</strong>
      <div className="meta">
        {value != null ? `$${value}/mo` : '—'} • Follow-up: {followUpDate ?? '—'}
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button
          className="btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setEditing((v) => !v)
          }}
        >
          Follow-up
        </button>
      </div>

      {editing && (
        <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
          <div className="label">Next follow-up</div>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="label" style={{ marginTop: 8 }}>Note</div>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Call GM, drop by, etc." />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              className="btn primary"
              type="button"
              onClick={async () => {
                await onFollowUp(date || null, note || null)
                setEditing(false)
              }}
            >
              Save
            </button>
            <button
              className="btn"
              type="button"
              onClick={async () => {
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

import React from 'react'

export default function RejectedList({ items }) {
  if (!items || items.length === 0) return <div className="mt-6 text-sm text-slate-600">No rejections.</div>
  return (
    <div className="mt-6 text-sm text-slate-600">
      <div className="font-semibold mb-1">Rejected ({items.length}):</div>
      <ul className="list-disc ml-5 space-y-1">
        {items.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  )
}

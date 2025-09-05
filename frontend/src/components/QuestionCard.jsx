import React from 'react'

export default function QuestionCard({ q, idx }) {
  return (
    <div className="border rounded-xl p-3">
      <div className="text-sm text-slate-500 mb-1">{`Q${idx+1}`} · {q.difficulty || ''}</div>
      <div className="font-semibold mb-2">{q.stem}</div>
      {q.options && (
        <ul className="space-y-1">
          {['A','B','C','D'].map(k => {
            if (q.options[k] === undefined) return null
            const isCorrect = q.correct_option === k || (Array.isArray(q.correct_option) && q.correct_option.includes(k))
            return (
              <li key={k} className={isCorrect ? "p-2 bg-green-50 rounded border border-green-200" : "p-2 bg-slate-50 rounded border"}>
                <b>{k}.</b> {q.options[k]}
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-2 text-sm"><b>Explanation:</b> {q.explanation || ''}</div>
      {q.citation && (
        <>
          <div className="mt-2 text-xs text-slate-500">
            Source: {q.citation.file || ''}{q.citation.page != null ? ` · p.${q.citation.page}` : ''}
          </div>
          {q.citation.quote && (
            <blockquote className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-300 text-xs">
              {q.citation.quote}
            </blockquote>
          )}
        </>
      )}
    </div>
  )
}

import React, { useState } from 'react'

import './styles.css'
import { advise, health } from './api.js';

export default function App() {
  const [form, setForm] = useState({
    sector: 'finance',
    org_size: 'mid',
    geography: 'US',
    goals: '',
    pain_points: '',
    constraints: '',
    current_tools: '',
    compliance: 'SOX, ISO 27001',
    timeline_months: 6,
    budget_level: 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const payload = {
        ...form,
        timeline_months: parseInt(form.timeline_months, 10) || 6,
      }
      const res = await advise(payload)
      setPlan(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">GRC Solution Advisor</h1>
          <p className="text-slate-600 text-sm">Answer a few questions about your organization and goals. Get a staged, actionable plan.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Sector</label>
                <select name="sector" value={form.sector} onChange={onChange} className="w-full p-2 border rounded-lg">
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="technology">Technology</option>
                  <option value="public sector">Public Sector</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Org size</label>
                <select name="org_size" value={form.org_size} onChange={onChange} className="w-full p-2 border rounded-lg">
                  <option value="micro">Micro (&lt;50)</option>
                  <option value="smb">SMB (50–250)</option>
                  <option value="mid">Mid (250–2000)</option>
                  <option value="enterprise">Enterprise (&gt;2000)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Geography</label>
                <input name="geography" value={form.geography} onChange={onChange} className="w-full p-2 border rounded-lg" placeholder="US/EU/APAC" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Compliance targets</label>
                <input name="compliance" value={form.compliance} onChange={onChange} className="w-full p-2 border rounded-lg" placeholder="SOX, ISO 27001, SOC2, GDPR" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Goals</label>
              <textarea name="goals" value={form.goals} onChange={onChange} className="w-full h-20 p-3 border rounded-lg" placeholder="What outcomes do you want? e.g., implement audit mgmt, unify risk registers, automate controls" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Pain points</label>
                <textarea name="pain_points" value={form.pain_points} onChange={onChange} className="w-full h-20 p-3 border rounded-lg" placeholder="Where are the bottlenecks today?" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Constraints</label>
                <textarea name="constraints" value={form.constraints} onChange={onChange} className="w-full h-20 p-3 border rounded-lg" placeholder="Budget/time/skills/tooling constraints" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Current tools</label>
              <input name="current_tools" value={form.current_tools} onChange={onChange} className="w-full p-2 border rounded-lg" placeholder="GRC platform, SIEM, ticketing, data warehouse, etc." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Timeline (months)</label>
                <input name="timeline_months" type="number" min="1" max="36" value={form.timeline_months} onChange={onChange} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Budget level</label>
                <select name="budget_level" value={form.budget_level} onChange={onChange} className="w-full p-2 border rounded-lg">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700" type="submit" disabled={loading}>
              {loading ? 'Generating…' : 'Generate plan'}
            </button>

            {error && <div className="text-sm text-red-600 mt-2">Error: {error}</div>}
          </form>

          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Plan</h2>
            {!plan && <div className="text-slate-500">Submit the form to generate a tailored plan.</div>}

            {plan && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Executive summary</div>
                  <div className="p-3 border rounded-lg bg-slate-50">{plan.executive_summary}</div>
                </div>

                {!!plan.quick_wins?.length && (
                  <div>
                    <div className="text-sm font-semibold mb-1">Quick wins (2–4 weeks)</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {plan.quick_wins.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {!!plan.phases?.length && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Phases</div>
                    {plan.phases.map((p, i) => (
                      <div key={i} className="border rounded-xl p-3">
                        <div className="font-semibold">{p.name} <span className="text-slate-500 text-sm">· {p.duration_weeks} wks</span></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <ListBlock title="Objectives" items={p.objectives} />
                          <ListBlock title="Tasks" items={p.tasks} />
                          <ListBlock title="Deliverables" items={p.deliverables} />
                          <ListBlock title="Owners" items={p.owners} />
                          <ListBlock title="Risks" items={p.risks} />
                          <ListBlock title="Mitigations" items={p.mitigations} />
                          <ListBlock title="KPIs" items={p.kpis} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!!plan.recommended_stack?.length && (
                  <div>
                    <div className="text-sm font-semibold mb-1">Recommended stack</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {plan.recommended_stack.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {!!plan.compliance_mapping?.length && (
                  <div>
                    <div className="text-sm font-semibold mb-1">Compliance mapping</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {plan.compliance_mapping.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {!!plan.assumptions?.length && (
                  <div>
                    <div className="text-sm font-semibold mb-1">Assumptions</div>
                    <ul className="list-disc ml-5 space-y-1">
                      {plan.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-slate-500">© GRC Solution Advisor</footer>
      </div>
    </div>
  )
}

function ListBlock({ title, items }) {
  if (!items || !items.length) return null
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{title}</div>
      <ul className="list-disc ml-5 space-y-1 text-sm">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  )
}
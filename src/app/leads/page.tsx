'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { fetchLeads, updateLead, deleteLead, type Lead, type LeadStatus } from '@/lib/api'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'won', 'lost']

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#10b981',
  contacted: '#f59e0b',
  won: '#6366f1',
  lost: '#ef4444',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLeads({
        search: search || undefined,
        status: statusFilter || undefined,
      })
      setLeads(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    setSavingId(id)
    try {
      await updateLead(id, { status })
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  const grouped = STATUSES.reduce(
    (acc, s) => {
      acc[s] = leads.filter((l) => l.status === s)
      return acc
    },
    {} as Record<LeadStatus, Lead[]>
  )

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Pipeline 🚀</h1>
        <Link
          href="/leads/new"
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          + Add Lead
        </Link>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            flex: 1,
            minWidth: 200,
            fontSize: 14,
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            background: '#fff',
          }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
          <button onClick={load} style={{ marginLeft: 12, background: 'none', border: '1px solid #dc2626', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          Loading pipeline...
        </div>
      )}

      {/* Empty */}
      {!loading && !error && leads.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No leads yet</p>
          <Link href="/leads/new" style={{ color: '#3b82f6' }}>Create your first lead</Link>
        </div>
      )}

      {/* Pipeline Columns */}
      {!loading && !error && leads.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`,
          gap: 16,
          minHeight: 400,
          overflowX: 'auto',
        }}>
          {STATUSES.map((status) => (
            <div key={status}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: STATUS_COLORS[status],
                }} />
                <h3 style={{ margin: 0, fontSize: 16 }}>
                  {STATUS_LABELS[status]}
                </h3>
                <span style={{
                  background: '#f3f4f6',
                  borderRadius: 999,
                  padding: '2px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                }}>
                  {grouped[status].length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[status].map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: 14,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      <Link
                        href={`/leads/${lead.id}`}
                        style={{ color: '#111827', textDecoration: 'none' }}
                      >
                        {lead.name || 'Unnamed'}
                      </Link>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                      {lead.email || 'No email'}
                    </div>
                    {lead.company && (
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                        {lead.company}
                      </div>
                    )}

                    {/* Status actions */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {STATUSES.filter((s) => s !== lead.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(lead.id, s)}
                          disabled={savingId === lead.id}
                          style={{
                            padding: '4px 8px',
                            fontSize: 11,
                            borderRadius: 6,
                            border: `1px solid ${STATUS_COLORS[s]}`,
                            background: '#fff',
                            color: STATUS_COLORS[s],
                            cursor: savingId === lead.id ? 'not-allowed' : 'pointer',
                            opacity: savingId === lead.id ? 0.6 : 1,
                          }}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>

                    {/* Delete */}
                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          borderRadius: 6,
                          border: '1px solid #ef4444',
                          background: '#fff',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

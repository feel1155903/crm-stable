'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchLeadById, updateLead, deleteLead, type Lead, type LeadStatus } from '@/lib/api'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'won', 'lost']

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    company: '',
    status: 'new' as LeadStatus,
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLeadById(id)
      if (!data) {
        setError('Lead not found')
        return
      }
      setLead(data)
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country || '',
        company: data.company || '',
        status: (data.status as LeadStatus) || 'new',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load lead')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateLead(id, form)
      setLead(updated)
      alert('Saved successfully')
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead permanently?')) return
    try {
      await deleteLead(id)
      router.push('/leads')
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.push('/leads')} style={{ marginTop: 12, padding: '8px 16px' }}>
          Back to Leads
        </button>
      </div>
    )
  }

  if (!lead) return null

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Edit Lead</h1>
        <button
          onClick={() => router.push('/leads')}
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <div style={labelStyle}>Name</div>
        <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>Email</div>
        <input name="email" value={form.email} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>Phone</div>
        <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>Country</div>
        <input name="country" value={form.country} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>Company</div>
        <input name="company" value={form.company} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>Status</div>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          style={inputStyle}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: saving ? '#93c5fd' : '#3b82f6',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={handleDelete}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: '1px solid #ef4444',
              background: '#fff',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
          Created: {new Date(lead.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

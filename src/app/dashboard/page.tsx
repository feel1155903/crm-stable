'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { fetchDashboardStats, fetchLeadStatuses, type DashboardStats, type LeadStatus } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Dashboard 📊</h1>
        <p style={{ color: '#888' }}>Loading metrics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Dashboard 📊</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={load}>Retry</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard 📊</h1>
        <Link href="/leads" style={{ color: '#3b82f6' }}>View Pipeline →</Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'inline-block',
          minWidth: 200,
        }}>
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>Total Leads</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>
            {stats?.total_leads ?? 0}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {stats && Object.entries(stats.status_counts).map(([statusId, count]) => (
          <div
            key={statusId}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
              {stats.status_names[statusId] || 'Unknown'}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>
              {count}
            </div>
          </div>
        ))}
        {stats && stats.total_leads > 0 && (
          <div
            key="conversion"
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
              Conversion Rate (won)
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ec4899' }}>
              {stats.status_names && stats.status_counts
                ? Math.round(((stats.status_counts['00d77f25-30a3-41af-b0a8-1e6e71c3269c'] || 0) / stats.total_leads) * 100) + '%'
                : '0%'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { fetchDashboardStats, type DashboardStats } from '@/lib/api'

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

  useEffect(() => {
    load()
  }, [load])

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

  const cards = [
    { label: 'Total Leads', value: stats?.total_leads ?? 0, color: '#3b82f6' },
    { label: 'New', value: stats?.new_leads ?? 0, color: '#10b981' },
    { label: 'Contacted', value: stats?.contacted_leads ?? 0, color: '#f59e0b' },
    { label: 'Won', value: stats?.won_leads ?? 0, color: '#6366f1' },
    { label: 'Lost', value: stats?.lost_leads ?? 0, color: '#ef4444' },
    {
      label: 'Conversion Rate',
      value: `${stats?.conversion_rate ?? 0}%`,
      color: '#ec4899',
    },
  ]

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard 📊</h1>
        <Link href="/leads" style={{ color: '#3b82f6' }}>View Pipeline →</Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

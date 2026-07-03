'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { fetchLeads, fetchLeadStatuses, deleteLead, type Lead, type LeadStatus } from '@/lib/api'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [leadsData, statusesData] = await Promise.all([
        fetchLeads({ search: search || undefined, statusId: statusFilter || undefined }),
        fetchLeadStatuses(),
      ])
      setLeads(leadsData)
      setStatuses(statusesData)
    } catch (err: any) {
      setError(err.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此线索？')) return
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (err: any) {
      alert(err.message || '删除失败')
    }
  }

  const grouped = statuses.reduce(
    (acc, s) => { acc[s.id] = leads.filter((l) => l.status_id === s.id); return acc },
    {} as Record<string, Lead[]>
  )

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Pipeline 🚀</h1>
        <Link href="/leads/new" style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          + 新增线索
        </Link>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="搜索姓名/邮箱/公司..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', flex: 1, minWidth: 200, fontSize: 14 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
        >
          <option value="">所有状态</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
          <button onClick={load} style={{ marginLeft: 12, background: 'none', border: '1px solid #dc2626', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>重试</button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>加载中...</div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>暂无线索</p>
          <Link href="/leads/new" style={{ color: '#3b82f6' }}>创建第一条线索</Link>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statuses.length}, 1fr)`, gap: 16, overflowX: 'auto' }}>
          {statuses.map((status) => (
            <div key={status.id}>
              <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
                {status.name}
                <span style={{ background: '#f3f4f6', borderRadius: 999, padding: '2px 10px', fontSize: 12, marginLeft: 8, color: '#6b7280' }}>
                  {grouped[status.id]?.length || 0}
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(grouped[status.id] || []).map((lead) => (
                  <div key={lead.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      <Link href={`/leads/${lead.id}`} style={{ color: '#111827', textDecoration: 'none' }}>
                        {lead.contact_name || '未命名'}
                      </Link>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>{lead.email || ''}</div>
                    {lead.company_name && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>{lead.company_name}</div>}
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{lead.country || ''}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => handleDelete(lead.id)} style={{ padding: '4px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer' }}>
                        删除
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

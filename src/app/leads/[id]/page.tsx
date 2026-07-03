'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchLeadById, fetchLeadStatuses, updateLead, deleteLead, type Lead, type LeadStatus } from '@/lib/api'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [lead, setLead] = useState<Lead | null>(null)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    contact_name: '',
    company_name: '',
    email: '',
    phone: '',
    country: '',
    notes: '',
    status_id: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, statusList] = await Promise.all([
        fetchLeadById(id),
        fetchLeadStatuses(),
      ])
      if (!data) { setError('线索不存在'); return }
      setLead(data)
      setStatuses(statusList)
      setForm({
        contact_name: data.contact_name || '',
        company_name: data.company_name || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country || '',
        notes: data.notes || '',
        status_id: data.status_id || '',
      })
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateLead(id, form)
      alert('保存成功')
    } catch (err: any) {
      alert(err.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除此线索？')) return
    try {
      await deleteLead(id)
      router.push('/leads')
    } catch (err: any) {
      alert(err.message || '删除失败')
    }
  }

  if (loading) return <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}><p style={{ color: '#888' }}>加载中...</p></div>
  if (error) return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <p style={{ color: 'red' }}>{error}</p>
      <button onClick={() => router.push('/leads')} style={{ marginTop: 12, padding: '8px 16px' }}>返回线索列表</button>
    </div>
  )
  if (!lead) return null

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginTop: 4, marginBottom: 16, boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151' }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>编辑线索</h1>
        <button onClick={() => router.push('/leads')} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}>← 返回</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <div style={labelStyle}>联系人姓名</div>
        <input name="contact_name" value={form.contact_name} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>公司名称</div>
        <input name="company_name" value={form.company_name} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>邮箱</div>
        <input name="email" value={form.email} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>电话</div>
        <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>国家</div>
        <input name="country" value={form.country} onChange={handleChange} style={inputStyle} />

        <div style={labelStyle}>备注</div>
        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />

        <div style={labelStyle}>状态</div>
        <select name="status_id" value={form.status_id} onChange={handleChange} style={inputStyle}>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 1, padding: '12px 24px', borderRadius: 8, border: 'none', background: saving ? '#93c5fd' : '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={handleDelete}
            style={{ padding: '12px 24px', borderRadius: 8, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

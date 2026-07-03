'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLead, fetchLeadStatuses } from '@/lib/api'

export default function NewLeadPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    contact_name: '',
    company_name: '',
    email: '',
    phone: '',
    country: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createLead(form)
      router.push('/leads')
    } catch (err: any) {
      setError(err.message || '创建失败')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginTop: 4, marginBottom: 16, boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151' }

  return (
    <div style={{ padding: 40, maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>新增线索</h1>
        <button onClick={() => router.push('/leads')} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}>← 返回</button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
        <div style={labelStyle}>联系人姓名 *</div>
        <input name="contact_name" value={form.contact_name} onChange={handleChange} required style={inputStyle} placeholder="张三" />

        <div style={labelStyle}>公司名称</div>
        <input name="company_name" value={form.company_name} onChange={handleChange} style={inputStyle} placeholder="某某科技有限公司" />

        <div style={labelStyle}>邮箱 *</div>
        <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="zhang@example.com" />

        <div style={labelStyle}>电话</div>
        <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} placeholder="+86 13800138000" />

        <div style={labelStyle}>国家</div>
        <input name="country" value={form.country} onChange={handleChange} style={inputStyle} placeholder="中国" />

        <button type="submit" disabled={saving}
          style={{ width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none', background: saving ? '#93c5fd' : '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8 }}>
          {saving ? '创建中...' : '创建线索'}
        </button>
      </form>
    </div>
  )
}

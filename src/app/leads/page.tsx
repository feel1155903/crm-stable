'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../../lib/supabase'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    async function loadLeads() {
      const supabase = getSupabaseClient()

      if (!supabase) {
        setMessage('Supabase environment variables are missing.')
        return
      }

      const { data, error } = await supabase.from('leads').select('*')

      if (error) {
        setMessage(error.message)
        return
      }

      setLeads(data || [])
      setMessage('')
    }

    loadLeads()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>Leads</h1>

      {message && <p>{message}</p>}

      {leads.map((lead) => (
        <div key={lead.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
          <div><b>Name:</b> {lead.name || '-'}</div>
          <div><b>Email:</b> {lead.email || '-'}</div>
          <div><b>Country:</b> {lead.country || '-'}</div>
        </div>
      ))}
    </div>
  )
}

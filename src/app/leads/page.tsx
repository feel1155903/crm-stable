'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')

    if (!error) {
      setLeads(data || [])
    } else {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Leads 🚀</h1>

      <div style={{ marginTop: 20 }}>
        {leads.map((l) => (
          <div key={l.id} style={{ padding: 10, border: '1px solid #ddd', marginBottom: 10 }}>
            <div><b>Name:</b> {l.name}</div>
            <div><b>Email:</b> {l.email}</div>
            <div><b>Country:</b> {l.country}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
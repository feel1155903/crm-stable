import { getSupabaseClient } from './supabase'

export interface Lead {
  id: string
  contact_name: string
  company_name: string
  email: string
  phone: string
  country: string
  status_id: string
  status_name?: string
  notes: string
  created_at: string
}

export interface LeadStatus {
  id: string
  name: string
}

export interface DashboardStats {
  total_leads: number
  status_counts: Record<string, number>
  status_names: Record<string, string>
}

function getClient() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not initialized')
  return supabase
}

// ---- Lead Statuses ----
const STATUS_CACHE: LeadStatus[] = []
let STATUS_LOADED = false

export async function fetchLeadStatuses(): Promise<LeadStatus[]> {
  if (STATUS_LOADED) return STATUS_CACHE
  const supabase = getClient()
  const { data, error } = await supabase.from('lead_statuses').select('id, name')
  if (error) throw error
  STATUS_CACHE.length = 0
  STATUS_CACHE.push(...(data || []))
  STATUS_LOADED = true
  return STATUS_CACHE
}

// ---- Leads ----

export async function fetchLeads(options?: {
  search?: string
  statusId?: string
}): Promise<Lead[]> {
  const supabase = getClient()

  let query = supabase
    .from('leads')
    .select(`
      id,
      contact_name,
      company_name,
      email,
      phone,
      country,
      status_id,
      notes,
      created_at,
      lead_statuses!inner(name)
    `)
    .order('created_at', { ascending: false })

  if (options?.statusId) {
    query = query.eq('status_id', options.statusId)
  }

  if (options?.search) {
    query = query.or(
      `contact_name.ilike.%${options.search}%,email.ilike.%${options.search}%,company_name.ilike.%${options.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((item: any) => ({
    id: item.id,
    contact_name: item.contact_name || '',
    company_name: item.company_name || '',
    email: item.email || '',
    phone: item.phone || '',
    country: item.country || '',
    status_id: item.status_id,
    status_name: item.lead_statuses?.name || '',
    notes: item.notes || '',
    created_at: item.created_at,
  })) as Lead[]
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('leads')
    .select(`
      id,
      contact_name,
      company_name,
      email,
      phone,
      country,
      status_id,
      notes,
      created_at,
      lead_statuses(name)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  if (!data) return null
  return {
    ...data,
    contact_name: data.contact_name || '',
    company_name: data.company_name || '',
    email: data.email || '',
    phone: data.phone || '',
    country: data.country || '',
    notes: data.notes || '',
    status_name: (data as any).lead_statuses?.name || '',
  } as Lead
}

export async function createLead(input: {
  contact_name: string
  email: string
  phone?: string
  country?: string
  company_name?: string
  status_id?: string
}): Promise<Lead> {
  const supabase = getClient()

  // default to "新线索" status
  const statusId = input.status_id || '29eb6e3e-58aa-4bdb-a698-2c946a9a6263'

  const { data, error } = await supabase
    .from('leads')
    .insert({
      contact_name: input.contact_name,
      company_name: input.company_name || '',
      email: input.email,
      phone: input.phone || '',
      country: input.country || '',
      status_id: statusId,
      notes: '',
    })
    .select()
    .single()
  if (error) throw error
  return data as Lead
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<Lead> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Lead
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

// ---- Dashboard ----

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = getClient()
  const [statuses, { data: leads }] = await Promise.all([
    fetchLeadStatuses(),
    supabase.from('leads').select('status_id'),
  ])

  const statusNames: Record<string, string> = {}
  statuses.forEach((s) => { statusNames[s.id] = s.name })

  const statusCounts: Record<string, number> = {}
  const total = leads?.length || 0
  leads?.forEach((l: any) => {
    const sid = l.status_id
    statusCounts[sid] = (statusCounts[sid] || 0) + 1
  })

  return {
    total_leads: total,
    status_counts: statusCounts,
    status_names: statusNames,
  }
}

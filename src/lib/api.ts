import { getSupabaseClient } from './supabase'

export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  country: string
  company: string
  status: LeadStatus
  created_at: string
}

export interface DashboardStats {
  total_leads: number
  new_leads: number
  contacted_leads: number
  won_leads: number
  lost_leads: number
  conversion_rate: number
}

function getClient() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase client not initialized')
  return supabase
}

// ---- Leads ----

export async function fetchLeads(options?: {
  search?: string
  status?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<Lead[]> {
  const supabase = getClient()
  let query = supabase.from('leads').select('*')

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,email.ilike.%${options.search}%`
    )
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  const sortField = options?.sortField || 'created_at'
  const sortOrder = options?.sortOrder || 'desc'
  query = query.order(sortField, { ascending: sortOrder === 'asc' })

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Lead[]
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Lead
}

export async function createLead(input: {
  name: string
  email: string
  phone: string
  country: string
  company?: string
}): Promise<Lead> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      country: input.country,
      company: input.company || '',
      status: 'new',
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
  const { data, error } = await supabase.from('leads').select('status')
  if (error) throw error

  const total = data?.length || 0
  const newLeads = data?.filter((d) => d.status === 'new').length || 0
  const contacted = data?.filter((d) => d.status === 'contacted').length || 0
  const won = data?.filter((d) => d.status === 'won').length || 0
  const lost = data?.filter((d) => d.status === 'lost').length || 0
  const conversion = total > 0 ? Math.round((won / total) * 100) : 0

  return {
    total_leads: total,
    new_leads: newLeads,
    contacted_leads: contacted,
    won_leads: won,
    lost_leads: lost,
    conversion_rate: conversion,
  }
}

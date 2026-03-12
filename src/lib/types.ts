
export type Lead = {
  id: string
  owner_id: string
  source: string
  name: string
  phone: string | null
  email: string | null
  address_text: string | null
  status: string
  created_at: string
}

export type Account = {
  id: string
  owner_id: string
  name: string
  industry: string | null
  status: string
}

export type Opportunity = {
  id: string
  owner_id: string
  lead_id: string | null
  account_id: string | null
  stage: string
  value_monthly: number | null
  next_follow_up_date: string | null
  next_follow_up_note: string | null
  created_at: string
}

export type Job = {
  id: string
  owner_id: string
  account_id: string
  location_id: string | null
  frequency: string
  day_of_week: number | null
  start_date: string | null
  active: boolean
  price_per_visit: number | null
  notes: string | null
}

export type Visit = {
  id: string
  owner_id: string
  job_id: string
  scheduled_for: string | null
  completed_at: string | null
  status: string
  notes: string | null
}

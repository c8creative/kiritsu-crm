
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

export type Connection = {
  id: string
  owner_id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  company: string | null
  website: string | null
  street: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  timeZone: string | null
  notes: string | null
  status: string // e.g., 'prospect', 'customer'
  created_at: string
}

export type Opportunity = {
  id: string
  owner_id: string
  lead_id: string | null
  connection_id: string | null // Formerly account_id
  account_name: string | null // Let's keep this for display but it should probably pull from connection.company or connection.name
  stage: string
  value_monthly: number | null
  next_follow_up_date: string | null
  next_follow_up_note: string | null
  lead_source: string | null
  created_at: string
}

export type Job = {
  id: string
  owner_id: string
  connection_id: string // Formerly account_id
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

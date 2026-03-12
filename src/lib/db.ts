import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut as fSignOut } from 'firebase/auth'
import { db, auth } from './firebase'
import type { Lead, Account, Opportunity, Job, Visit } from './types'

export async function getSessionUserId(): Promise<string | null> {
  return auth.currentUser?.uid ?? null
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  return fSignOut(auth)
}

// Leads
export async function listLeads(): Promise<Lead[]> {
  const q = query(collection(db, 'leads'), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead))
}

export async function createLead(input: Omit<Lead, 'id'|'owner_id'|'created_at'> & { owner_id?: string }) {
  const owner_id = input.owner_id ?? (await getSessionUserId())
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'leads'), {
    owner_id,
    source: input.source,
    name: input.name,
    phone: input.phone,
    email: input.email,
    address_text: input.address_text,
    status: input.status ?? 'new',
    created_at: new Date().toISOString()
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() } as Lead
}

export async function convertLeadToAccount(leadId: string) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')

  const leadRef = doc(db, 'leads', leadId)
  const leadSnap = await getDoc(leadRef)
  if (!leadSnap.exists()) throw new Error('Lead not found')
  const lead = leadSnap.data() as Lead

  const accRef = await addDoc(collection(db, 'accounts'), {
    owner_id,
    name: lead.name,
    status: 'prospect',
    created_at: new Date().toISOString()
  })
  const account = { id: accRef.id, ...(await getDoc(accRef)).data() }

  await updateDoc(leadRef, { status: 'converted' })

  const oppRef = await addDoc(collection(db, 'opportunities'), {
    owner_id,
    lead_id: leadId,
    account_id: accRef.id,
    stage: 'new',
    probability: 25,
    created_at: new Date().toISOString()
  })
  const opportunity = { id: oppRef.id, ...(await getDoc(oppRef)).data() }

  return { account, opportunity }
}

// Accounts
export async function listAccounts(): Promise<Account[]> {
  const q = query(collection(db, 'accounts'), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account))
}

export async function getAccount(accountId: string) {
  const accountRef = doc(db, 'accounts', accountId)
  const accountSnap = await getDoc(accountRef)
  if (!accountSnap.exists()) throw new Error('Account not found')
  const account = { id: accountSnap.id, ...accountSnap.data() }

  const fetchCollection = async (coll: string, orderField = 'created_at', direction: 'asc'|'desc' = 'asc') => {
    const q = query(collection(db, coll), where('account_id', '==', accountId), orderBy(orderField, direction))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  const [contacts, locations, opps, activities, jobs] = await Promise.all([
    fetchCollection('contacts'),
    fetchCollection('locations'),
    fetchCollection('opportunities', 'created_at', 'desc'),
    fetchCollection('activities', 'occurred_at', 'desc'),
    fetchCollection('jobs', 'created_at', 'desc')
  ])

  return { account, contacts, locations, opps, activities, jobs }
}

export async function addContact(account_id: string, payload: { name: string; role?: string; phone?: string; email?: string }) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'contacts'), { owner_id, account_id, created_at: new Date().toISOString(), ...payload })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

export async function addLocation(account_id: string, payload: { label?: string; address1?: string; city?: string; state?: string; zip?: string; notes?: string }) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'locations'), { owner_id, account_id, created_at: new Date().toISOString(), ...payload })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

export async function addActivity(account_id: string, opportunity_id: string | null, payload: { activity_type: string; summary?: string; details?: string }) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'activities'), {
    owner_id, account_id, opportunity_id, occurred_at: new Date().toISOString(), ...payload
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

// Opportunities / Pipeline
export const PIPELINE_STAGES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'walkthrough', label: 'Walkthrough Scheduled' },
  { key: 'quote_sent', label: 'Quote Sent' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'won', label: 'Won (Recurring)' },
  { key: 'lost', label: 'Lost / Not Now' },
] as const

export async function listOpportunities(): Promise<Opportunity[]> {
  const q = query(collection(db, 'opportunities'), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity))
}

export async function updateOpportunityStage(id: string, stage: string) {
  const oppRef = doc(db, 'opportunities', id)
  await updateDoc(oppRef, { stage, updated_at: new Date().toISOString() })
  const newDoc = await getDoc(oppRef)
  return { id: newDoc.id, ...newDoc.data() } as Opportunity
}

export async function setOpportunityFollowUp(id: string, next_follow_up_date: string | null, note: string | null) {
  const oppRef = doc(db, 'opportunities', id)
  await updateDoc(oppRef, { next_follow_up_date, next_follow_up_note: note, updated_at: new Date().toISOString() })
  const newDoc = await getDoc(oppRef)
  return { id: newDoc.id, ...newDoc.data() } as Opportunity
}

export async function listFollowUps(): Promise<Opportunity[]> {
  const q = query(collection(db, 'opportunities'), where('next_follow_up_date', '!=', null), orderBy('next_follow_up_date', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity))
}

// Jobs
export async function listJobs(): Promise<Job[]> {
  const q = query(collection(db, 'jobs'), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job))
}

export async function createJob(payload: Omit<Job,'id'|'owner_id'> & { owner_id?: string }) {
  const owner_id = payload.owner_id ?? (await getSessionUserId())
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'jobs'), {
    owner_id,
    created_at: new Date().toISOString(),
    ...payload
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() } as Job
}

export async function listVisits(job_id: string): Promise<Visit[]> {
  const q = query(collection(db, 'visits'), where('job_id', '==', job_id), orderBy('scheduled_for', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit))
}

export async function createVisit(job_id: string, scheduled_for: string | null) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'visits'), {
    owner_id, job_id, scheduled_for, status: 'scheduled', created_at: new Date().toISOString()
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() } as Visit
}

export async function completeVisit(visit_id: string, notes: string | null) {
  const visitRef = doc(db, 'visits', visit_id)
  await updateDoc(visitRef, { status: 'completed', completed_at: new Date().toISOString(), notes })
  const newDoc = await getDoc(visitRef)
  return { id: newDoc.id, ...newDoc.data() } as Visit
}

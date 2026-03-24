import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fSignOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, auth, storage } from './firebase'
import type { Lead, Connection, Opportunity, Job, Visit } from './types'

export interface SearchResult {
  id: string
  type: 'lead' | 'connection'
  title: string
  subtitle?: string
}

export async function globalSearch(queryStr: string): Promise<SearchResult[]> {
  const owner_id = await getSessionUserId()
  if (!owner_id || !queryStr.trim()) return []
  
  const term = queryStr.toLowerCase()
  
  const [leads, connections] = await Promise.all([
    listLeads(),
    listConnections()
  ])
  
  const leadResults: SearchResult[] = leads
    .filter(l => 
      (l.name?.toLowerCase().includes(term)) || 
      (l.email?.toLowerCase().includes(term)) || 
      (l.phone?.toLowerCase().includes(term))
    )
    .map(l => ({
      id: l.id,
      type: 'lead',
      title: l.name || 'Unnamed Lead',
      subtitle: `Lead • ${l.email || l.phone || l.status}`
    }))
    
  const connResults: SearchResult[] = connections
    .filter(c => 
      (c.firstName?.toLowerCase().includes(term)) || 
      (c.lastName?.toLowerCase().includes(term)) || 
      (c.email?.toLowerCase().includes(term)) || 
      (c.phone?.toLowerCase().includes(term)) ||
      (c.company?.toLowerCase().includes(term))
    )
    .map(c => ({
      id: c.id,
      type: 'connection',
      title: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Connection',
      subtitle: `Connection • ${c.company || c.email || 'No Email'}`
    }))
    
  return [...leadResults, ...connResults].slice(0, 10)
}

export async function getSessionUserId(): Promise<string | null> {
  return auth.currentUser?.uid ?? null
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export async function signOut() {
  return fSignOut(auth)
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

// Leads
export async function listLeads(): Promise<Lead[]> {
  const owner_id = await getSessionUserId()
  if (!owner_id) return []
  try {
    const q = query(
      collection(db, 'leads'),
      where('owner_id', '==', owner_id),
      orderBy('created_at', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead))
  } catch (err) {
    console.error('Error listing leads:', err)
    throw err
  }
}

export async function createLead(input: Omit<Lead, 'id'|'owner_id'|'created_at'> & { owner_id?: string }) {
  const owner_id = input.owner_id ?? (await getSessionUserId())
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'leads'), {
    owner_id,
    source: input.source,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    name: input.name ?? '',
    phone: input.phone,
    email: input.email,
    address_text: input.address_text,
    status: input.status ?? 'new',
    created_at: new Date().toISOString()
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() } as Lead
}

export async function convertLeadToConnection(leadId: string) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')

  const leadRef = doc(db, 'leads', leadId)
  const leadSnap = await getDoc(leadRef)
  if (!leadSnap.exists()) throw new Error('Lead not found')
  const lead = leadSnap.data() as Lead

  let firstName = lead.firstName || ''
  let lastName = lead.lastName || ''

  if (!firstName && !lastName) {
    // legacy fallback
    const parts = (lead.name || '').trim().split(/\s+/)
    firstName = parts[0] || ''
    lastName = parts.slice(1).join(' ')
  }

  const connRef = await addDoc(collection(db, 'connections'), {
    owner_id,
    firstName,
    lastName,
    company: lead.name || null,
    email: lead.email,
    phone: lead.phone,
    street: lead.address_text,
    status: 'prospect',
    created_at: new Date().toISOString()
  })
  const connection = { id: connRef.id, ...(await getDoc(connRef)).data() }

  await updateDoc(leadRef, { status: 'converted' })

  const oppRef = await addDoc(collection(db, 'opportunities'), {
    owner_id,
    lead_id: leadId,
    connection_id: connRef.id,
    account_name: lead.name, // Display helper
    lead_source: lead.source,
    stage: 'new',
    created_at: new Date().toISOString()
  })
  const opportunity = { id: oppRef.id, ...(await getDoc(oppRef)).data() }

  return { connection, opportunity }
}

// Connections
export async function listConnections(): Promise<Connection[]> {
  const owner_id = await getSessionUserId()
  if (!owner_id) return []
  const q = query(
    collection(db, 'connections'),
    where('owner_id', '==', owner_id),
    orderBy('created_at', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection))
}

export async function getConnection(connectionId: string) {
  const connRef = doc(db, 'connections', connectionId)
  const connSnap = await getDoc(connRef)
  if (!connSnap.exists()) throw new Error('Connection not found')
  const connection = { id: connSnap.id, ...connSnap.data() }

  const fetchCollection = async (coll: string, orderField = 'created_at', direction: 'asc'|'desc' = 'asc') => {
    const q = query(collection(db, coll), where('connection_id', '==', connectionId))
    const snap = await getDocs(q)
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    items.sort((a: any, b: any) => {
        const valA = a[orderField] || ''
        const valB = b[orderField] || ''
        if (direction === 'asc') return valA > valB ? 1 : -1
        return valA < valB ? 1 : -1
    })
    return items
  }

  const [opportunities, activities, jobs] = await Promise.all([
    fetchCollection('opportunities', 'created_at', 'desc'),
    fetchCollection('activities', 'occurred_at', 'desc'),
    fetchCollection('jobs', 'created_at', 'desc')
  ])

  return { connection, opportunities, activities, jobs }
}

export async function createConnection(payload: Omit<Connection, 'id'|'owner_id'|'created_at'>) {
    const owner_id = await getSessionUserId()
    if (!owner_id) throw new Error('Not authenticated')
    const docRef = await addDoc(collection(db, 'connections'), {
        owner_id,
        ...payload,
        created_at: new Date().toISOString()
    })
    const newDoc = await getDoc(docRef)
    return { id: newDoc.id, ...newDoc.data() } as Connection
}

export async function updateConnection(connectionId: string, payload: Partial<Omit<Connection, 'id'|'owner_id'|'created_at'>>) {
    const connRef = doc(db, 'connections', connectionId)
    await updateDoc(connRef, { ...payload, updated_at: new Date().toISOString() })
    const updated = await getDoc(connRef)
    return { id: updated.id, ...updated.data() } as Connection
}

export async function deleteConnection(connectionId: string) {
    await deleteDoc(doc(db, 'connections', connectionId))
}

export async function addActivity(connection_id: string, opportunity_id: string | null, payload: { activity_type: string; summary?: string; details?: string }) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const docRef = await addDoc(collection(db, 'activities'), {
    owner_id, connection_id, opportunity_id, occurred_at: new Date().toISOString(), ...payload
  })
  const newDoc = await getDoc(docRef)
  return { id: newDoc.id, ...newDoc.data() }
}

// Opportunities / Pipeline
export const PIPELINE_STAGES = [
  { key: 'new', label: 'New', icon: '✨' },
  { key: 'contacted', label: 'Contacted', icon: '📞' },
  { key: 'walkthrough', label: 'Quote Pending', icon: '🗓️' },
  { key: 'quote_sent', label: 'Quote Sent', icon: '📄' },
  { key: 'negotiation', label: 'Negotiation', icon: '🤝' },
  { key: 'won', label: 'Won', icon: '✅' },
  { key: 'lost', label: 'Lost / Not Now', icon: '❌' },
] as const

export async function listOpportunities(): Promise<Opportunity[]> {
  const owner_id = await getSessionUserId()
  if (!owner_id) return []
  const q = query(
    collection(db, 'opportunities'),
    where('owner_id', '==', owner_id),
    orderBy('created_at', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity))
}

export async function createOpportunity(connection_id: string, payload?: Partial<Opportunity>) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  
  const connRef = doc(db, 'connections', connection_id)
  const connSnap = await getDoc(connRef)
  if (!connSnap.exists()) throw new Error('Connection not found')
  const connection = connSnap.data() as Connection

  const oppRef = await addDoc(collection(db, 'opportunities'), {
    owner_id,
    lead_id: null,
    connection_id,
    account_name: payload?.account_name || `${connection.firstName || ''} ${connection.lastName || ''}`.trim() || connection.company || 'Unnamed',
    lead_source: payload?.lead_source || 'direct',
    stage: 'new',
    created_at: new Date().toISOString(),
    ...payload
  })
  const newDoc = await getDoc(oppRef)
  return { id: newDoc.id, ...newDoc.data() } as Opportunity
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
  const owner_id = await getSessionUserId()
  if (!owner_id) return []
  const q = query(
    collection(db, 'opportunities'),
    where('owner_id', '==', owner_id),
    where('next_follow_up_date', '!=', null),
    orderBy('next_follow_up_date', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity))
}

// Jobs
export async function listJobs(): Promise<Job[]> {
  const owner_id = await getSessionUserId()
  if (!owner_id) return []
  const q = query(
    collection(db, 'jobs'),
    where('owner_id', '==', owner_id),
    orderBy('created_at', 'desc')
  )
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

// Settings
export async function getUserSettings() {
  const owner_id = await getSessionUserId()
  if (!owner_id) return null
  const settingsRef = doc(db, 'user_settings', owner_id)
  const snap = await getDoc(settingsRef)
  if (snap.exists()) {
    return snap.data()
  }
  return { email_notifications: true } // Default
}

export async function updateUserSettings(payload: any) {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  const settingsRef = doc(db, 'user_settings', owner_id)
  await setDoc(settingsRef, { ...payload, updated_at: new Date().toISOString() }, { merge: true })
}

export async function uploadLogo(file: File): Promise<string> {
  const owner_id = await getSessionUserId()
  if (!owner_id) throw new Error('Not authenticated')
  
  const storageRef = ref(storage, `branding/${owner_id}/logo`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  
  const settingsRef = doc(db, 'user_settings', owner_id)
  await updateDoc(settingsRef, { 
    'branding.logo_url': downloadURL,
    updated_at: new Date().toISOString()
  })
  return downloadURL
}

export async function resetLogo(): Promise<void> {
    const owner_id = await getSessionUserId()
    if (!owner_id) throw new Error('Not authenticated')
    const settingsRef = doc(db, 'user_settings', owner_id)
    await updateDoc(settingsRef, { 
        'branding.logo_url': null,
        updated_at: new Date().toISOString()
    })
}


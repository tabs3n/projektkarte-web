import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client — used in browser / map fetching
export const supabase = createClient(url, anon)

// Admin client — used server-side only, bypasses RLS
export const supabaseAdmin = createClient(url, service)

export type Project = {
  id: string
  iso: string
  country: string
  title: string
  city: string | null
  year: number | null
  client: string | null
  blurb: string | null
  quote: string | null
  lat: number | null
  lng: number | null
  created_at: string
  project_images?: ProjectImage[]
}

export type ProjectImage = {
  id: string
  project_id: string
  url: string
  sort_order: number
}

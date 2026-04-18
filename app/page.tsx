import { supabase } from '@/lib/supabase'
import Map from '@/components/Map'
import Script from 'next/script'

export const revalidate = 0

export default async function HomePage() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_images(url, sort_order)')
    .order('created_at')

  const countryCount = new Set(projects?.map(p => p.iso) ?? []).size

  return (
    <>
      <Script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js" strategy="beforeInteractive" />
      <Script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" strategy="beforeInteractive" />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 80px' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 18, marginBottom: 20, borderBottom: '1.5px dashed #1a1a1a' }}>
          <h1 style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 48, margin: 0, lineHeight: 1, color: '#1a1a1a' }}>
            Projektkarte
          </h1>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a8578', textAlign: 'right' }}>
            <div>
              <b style={{ color: '#1a1a1a' }}>{countryCount}</b> Länder ·{' '}
              <b style={{ color: '#1a1a1a' }}>{projects?.length ?? 0}</b> Projekte
            </div>
          </div>
        </header>

        <div style={{ border: '1.5px solid #1a1a1a', boxShadow: '4px 4px 0 #1a1a1a', overflow: 'hidden', position: 'relative', width: '100%' }}>
          <Map projects={projects ?? []} accent="#1e3a5f" />
        </div>
      </main>
    </>
  )
}

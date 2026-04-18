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

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '32px clamp(16px, 4vw, 48px) 80px', width: '100%' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 20, marginBottom: 24, borderBottom: '1px solid #1a1a1a' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#6b6658', marginBottom: 6 }}>
              Referenzen
            </div>
            <h1 style={{ fontWeight: 600, fontSize: 'clamp(28px, 4vw, 40px)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1a1a1a' }}>
              Projektkarte
            </h1>
          </div>
          <div style={{ fontSize: 12, color: '#6b6658', textAlign: 'right', lineHeight: 1.5 }}>
            <div>
              <b style={{ color: '#1a1a1a', fontWeight: 600 }}>{countryCount}</b> Länder
            </div>
            <div>
              <b style={{ color: '#1a1a1a', fontWeight: 600 }}>{projects?.length ?? 0}</b> Projekte
            </div>
          </div>
        </header>

        <div style={{ border: '1px solid #1a1a1a', overflow: 'hidden', position: 'relative', width: '100%', background: '#f5f2ea' }}>
          <Map projects={projects ?? []} accent="#1e3a5f" />
        </div>
      </main>
    </>
  )
}

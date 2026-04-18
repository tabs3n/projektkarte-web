import { supabase } from '@/lib/supabase'
import Map from '@/components/Map'
import Script from 'next/script'

export const revalidate = 60

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

      <main className="max-w-[1440px] mx-auto px-8 py-7 pb-20 relative z-10">
        <header className="flex items-end justify-between gap-6 pb-4 mb-5 border-b border-dashed border-stone-800">
          <h1 className="font-['Caveat'] font-bold text-5xl leading-none tracking-tight">Projektkarte</h1>
          <div className="font-mono text-xs text-stone-400 text-right">
            <div><b className="text-stone-900">{countryCount}</b> Länder · <b className="text-stone-900">{projects?.length ?? 0}</b> Projekte</div>
          </div>
        </header>

        <div className="border border-stone-900 shadow-[4px_4px_0_#1a1a1a] overflow-hidden relative">
          <Map projects={projects ?? []} />
        </div>
      </main>
    </>
  )
}

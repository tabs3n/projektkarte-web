import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminPage() {
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*, project_images(count)')
    .order('country')

  const byCountry: Record<string, typeof projects> = {}
  projects?.forEach(p => {
    if (!byCountry[p.iso]) byCountry[p.iso] = []
    byCountry[p.iso]!.push(p)
  })

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Projekte</h1>
        <span className="text-stone-400 text-sm">{projects?.length ?? 0} Einträge</span>
      </div>

      {!projects?.length && (
        <div className="border border-dashed border-stone-300 rounded p-12 text-center text-stone-400">
          Noch keine Projekte. <Link href="/admin/projekte/neu" className="underline">Erstes anlegen →</Link>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {projects?.map(p => (
          <Link key={p.id} href={`/admin/projekte/${p.id}`}
            className="flex items-center justify-between bg-white border border-stone-200 px-4 py-3 hover:border-stone-400 transition-colors group">
            <div>
              <span className="text-xs text-stone-400 mr-3 border border-stone-200 px-1.5 py-0.5">{p.iso}</span>
              <span className="font-medium text-stone-900">{p.title}</span>
              <span className="text-stone-400 ml-3 text-sm">{p.country}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              {p.year && <span>{p.year}</span>}
              {p.client && <span>{p.client}</span>}
              <span className="group-hover:text-stone-900 transition-colors">Bearbeiten →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

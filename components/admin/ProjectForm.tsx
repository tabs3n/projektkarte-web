'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectImage } from '@/lib/supabase'

const COUNTRY_CODES: Record<string, string> = {
  DEU: 'Deutschland', AUT: 'Österreich', CHE: 'Schweiz', FRA: 'Frankreich',
  ESP: 'Spanien', PRT: 'Portugal', ITA: 'Italien', GBR: 'Vereinigtes Königreich',
  IRL: 'Irland', NLD: 'Niederlande', BEL: 'Belgien', DNK: 'Dänemark',
  SWE: 'Schweden', NOR: 'Norwegen', FIN: 'Finnland', POL: 'Polen',
  CZE: 'Tschechien', GRC: 'Griechenland', TUR: 'Türkei', ARE: 'VAE',
  SAU: 'Saudi-Arabien', ISR: 'Israel', EGY: 'Ägypten', ZAF: 'Südafrika',
  KEN: 'Kenia', IND: 'Indien', CHN: 'China', JPN: 'Japan',
  KOR: 'Südkorea', SGP: 'Singapur', AUS: 'Australien', USA: 'USA',
  CAN: 'Kanada', BRA: 'Brasilien', MEX: 'Mexiko', ARG: 'Argentinien',
  NGA: 'Nigeria', ZAR: 'DR Kongo', ETH: 'Äthiopien', TZA: 'Tansania',
  MAR: 'Marokko', GHA: 'Ghana', UKR: 'Ukraine', RUS: 'Russland',
  IDN: 'Indonesien', THA: 'Thailand', VNM: 'Vietnam', MYS: 'Malaysia',
  PHL: 'Philippinen', PAK: 'Pakistan', BGD: 'Bangladesch', IRN: 'Iran',
  IRQ: 'Irak', SYR: 'Syrien', YEM: 'Jemen', AFG: 'Afghanistan',
  COL: 'Kolumbien', PER: 'Peru', CHL: 'Chile', VEN: 'Venezuela',
}

type Props = {
  project?: Project & { project_images: ProjectImage[] }
  mode: 'create' | 'edit'
}

export default function ProjectForm({ project, mode }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<{ id?: string; url: string; file?: File }[]>(
    project?.project_images?.map(i => ({ id: i.id, url: i.url })) ?? []
  )
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState({
    iso: project?.iso ?? '',
    country: project?.country ?? '',
    title: project?.title ?? '',
    city: project?.city ?? '',
    year: project?.year?.toString() ?? '',
    client: project?.client ?? '',
    blurb: project?.blurb ?? '',
    quote: project?.quote ?? '',
    lat: project?.lat?.toString() ?? '',
    lng: project?.lng?.toString() ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => {
      const next = { ...f, [field]: value }
      if (field === 'iso' && COUNTRY_CODES[value]) next.country = COUNTRY_CODES[value]
      return next
    })
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const previews = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))
    setImages(prev => [...prev, ...previews])
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fd = new FormData()
    fd.append('mode', mode)
    if (project?.id) fd.append('id', project.id)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    // Append new image files
    images.forEach((img, i) => {
      if (img.file) fd.append(`image_${i}`, img.file)
      else if (img.id) fd.append(`keep_${i}`, img.id)
    })

    const res = await fetch('/api/admin/project', { method: 'POST', body: fd })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Fehler beim Speichern')
      setSaving(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!project?.id || !confirm('Projekt wirklich löschen?')) return
    await fetch('/api/admin/project', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id }),
    })
    router.push('/admin')
    router.refresh()
  }

  const field = (label: string, key: string, opts?: { textarea?: boolean; type?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={form[key as keyof typeof form]}
          onChange={e => set(key, e.target.value)}
          required={opts?.required}
          rows={3}
          style={{ color: '#1a1a1a', background: '#ffffff' }}
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-stone-600 resize-none"
        />
      ) : (
        <input
          type={opts?.type ?? 'text'}
          value={form[key as keyof typeof form]}
          onChange={e => set(key, e.target.value)}
          required={opts?.required}
          style={{ color: '#1a1a1a', background: '#ffffff' }}
          className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-stone-600"
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-400 uppercase tracking-widest mb-1">ISO-Code *</label>
          <select
            value={form.iso}
            onChange={e => set('iso', e.target.value)}
            required
            style={{ color: '#1a1a1a', background: '#ffffff' }}
            className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-stone-600"
          >
            <option value="">— Land wählen —</option>
            {Object.entries(COUNTRY_CODES).sort(([, a], [, b]) => a.localeCompare(b, 'de')).map(([iso, name]) => (
              <option key={iso} value={iso}>{name} ({iso})</option>
            ))}
          </select>
        </div>
        {field('Land (Name)', 'country', { required: true })}
      </div>

      {field('Projekttitel *', 'title', { required: true })}

      <div className="grid grid-cols-3 gap-4">
        {field('Stadt', 'city')}
        {field('Jahr', 'year', { type: 'number' })}
        {field('Kunde', 'client')}
      </div>

      {field('Kurzbeschreibung', 'blurb', { textarea: true })}
      {field('Zitat (optional)', 'quote')}

      <div className="grid grid-cols-2 gap-4">
        {field('Breitengrad (Lat, optional)', 'lat')}
        {field('Längengrad (Lng, optional)', 'lng')}
      </div>
      <p className="text-xs text-stone-500 -mt-3">
        Pin-Position: z.B. Berlin 52.52 / 13.40. Leer lassen → Pin erscheint im Land-Zentrum. Koordinaten finden auf <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline">Google Maps</a> (Rechtsklick auf Ort).
      </p>

      {/* Image upload */}
      <div>
        <label className="block text-xs text-stone-400 uppercase tracking-widest mb-1">Bilder</label>
        <div
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-stone-500 bg-stone-50' : 'border-stone-200'}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        >
          <p className="text-stone-400 text-sm">Bilder hierher ziehen oder klicken zum Auswählen</p>
          <p className="text-stone-300 text-xs mt-1">JPG, PNG, WebP</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover border border-stone-200" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
        <button type="submit" disabled={saving}
          className="bg-stone-900 text-white px-6 py-2 text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors">
          {saving ? 'Speichert…' : mode === 'create' ? 'Projekt anlegen' : 'Änderungen speichern'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-stone-400 text-sm hover:text-stone-600">
          Abbrechen
        </button>
        {mode === 'edit' && (
          <button type="button" onClick={handleDelete}
            className="ml-auto text-red-400 text-sm hover:text-red-600">
            Löschen
          </button>
        )}
      </div>
    </form>
  )
}

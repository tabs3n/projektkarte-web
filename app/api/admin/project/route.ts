import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function unauthorized() {
  return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
}

function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get('admin_session')?.value
  return cookie === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const fd = await req.formData()
  const mode = fd.get('mode') as string
  const id = fd.get('id') as string | null

  const fields = {
    iso: fd.get('iso') as string,
    country: fd.get('country') as string,
    title: fd.get('title') as string,
    city: (fd.get('city') as string) || null,
    year: fd.get('year') ? Number(fd.get('year')) : null,
    client: (fd.get('client') as string) || null,
    blurb: (fd.get('blurb') as string) || null,
    quote: (fd.get('quote') as string) || null,
    lat: fd.get('lat') ? Number(fd.get('lat')) : null,
    lng: fd.get('lng') ? Number(fd.get('lng')) : null,
  }

  let projectId = id

  if (mode === 'create') {
    const { data, error } = await supabaseAdmin.from('projects').insert(fields).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    projectId = data.id
  } else {
    const { error } = await supabaseAdmin.from('projects').update(fields).eq('id', id!)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Delete images not in the keep list
    const keepIds: string[] = []
    for (const [key, val] of fd.entries()) {
      if (key.startsWith('keep_')) keepIds.push(val as string)
    }
    if (keepIds.length > 0) {
      await supabaseAdmin.from('project_images')
        .delete()
        .eq('project_id', id!)
        .not('id', 'in', `(${keepIds.join(',')})`)
    } else {
      await supabaseAdmin.from('project_images').delete().eq('project_id', id!)
    }
  }

  // Upload new image files
  let sortOrder = 0
  for (const [key, val] of fd.entries()) {
    if (!key.startsWith('image_') || !(val instanceof File)) continue
    const ext = val.name.split('.').pop() ?? 'jpg'
    const path = `${projectId}/${Date.now()}-${sortOrder}.${ext}`
    const bytes = await val.arrayBuffer()

    const { error: upErr } = await supabaseAdmin.storage
      .from('project-images')
      .upload(path, bytes, { contentType: val.type, upsert: true })

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('project-images')
      .getPublicUrl(path)

    await supabaseAdmin.from('project_images').insert({
      project_id: projectId,
      url: publicUrl,
      sort_order: sortOrder++,
    })
  }

  return NextResponse.json({ ok: true, id: projectId })
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized()

  const { id } = await req.json()

  // Delete storage files
  const { data: images } = await supabaseAdmin
    .from('project_images').select('url').eq('project_id', id)

  if (images?.length) {
    const paths = images.map(i => {
      const url = new URL(i.url)
      return url.pathname.split('/project-images/')[1]
    }).filter(Boolean)
    if (paths.length) {
      await supabaseAdmin.storage.from('project-images').remove(paths)
    }
  }

  await supabaseAdmin.from('projects').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}

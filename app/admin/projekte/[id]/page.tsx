import { supabaseAdmin } from '@/lib/supabase'
import ProjectForm from '@/components/admin/ProjectForm'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('*, project_images(*)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">{project.title}</h1>
      <ProjectForm mode="edit" project={project} />
    </div>
  )
}

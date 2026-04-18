import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Neues Projekt</h1>
      <ProjectForm mode="create" />
    </div>
  )
}

import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 font-mono text-stone-900" style={{colorScheme:'light'}}>
      <nav className="border-b border-stone-200 bg-white px-6 py-3 flex items-center gap-6">
        <Link href="/admin" className="font-bold text-stone-900 tracking-tight">
          Projektkarte Admin
        </Link>
        <Link href="/admin/projekte/neu"
          className="ml-auto bg-stone-900 text-white text-sm px-4 py-1.5 hover:bg-stone-700 transition-colors">
          + Neues Projekt
        </Link>
        <Link href="/" className="text-stone-400 text-sm hover:text-stone-600">
          ← Website
        </Link>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Falsches Passwort')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center font-mono">
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-8 w-80 flex flex-col gap-4">
        <h1 className="text-lg font-bold text-stone-900">Admin Login</h1>
        <input
          type="password"
          placeholder="Passwort"
          value={pw}
          onChange={e => setPw(e.target.value)}
          className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-stone-500"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="bg-stone-900 text-white py-2 text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors">
          {loading ? '…' : 'Einloggen'}
        </button>
      </form>
    </div>
  )
}

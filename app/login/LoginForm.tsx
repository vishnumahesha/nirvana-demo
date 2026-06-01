'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const router = useRouter()

  async function handleEmailSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await getSupabaseBrowser().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: undefined },
    })
    if (error) setError(error.message)
    else setStep('code')
    setLoading(false)
  }

  async function handleCodeSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await getSupabaseBrowser().auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) setError(error.message)
    else router.push(next)
    setLoading(false)
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <p className="text-gray-400 text-sm text-center">
          Enter the 6-digit code sent to {email}
        </p>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          autoFocus
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-center text-2xl tracking-widest"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-brand hover:bg-brand/90 text-white"
        >
          {loading ? 'Verifying...' : 'Verify code'}
        </Button>
        <button
          type="button"
          onClick={() => { setStep('email'); setCode(''); setError('') }}
          className="w-full text-gray-500 text-sm hover:text-gray-300 transition-colors"
        >
          Use a different email
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-brand hover:bg-brand/90 text-white"
      >
        {loading ? 'Sending...' : 'Send code'}
      </Button>
    </form>
  )
}

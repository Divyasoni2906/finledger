import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Hexagon, ArrowRight } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

const DEMO_ACCOUNTS = [
  { label: 'Admin',   email: 'admin@finance.dev',   password: 'admin123',   desc: 'Full access' },
  { label: 'Analyst', email: 'analyst@finance.dev', password: 'analyst123', desc: 'Read + create' },
  { label: 'Viewer',  email: 'viewer@finance.dev',  password: 'viewer123',  desc: 'Read only' },
]

export default function Login() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  const handleLogin = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await api.post('/auth/login', { email, password })
      login(token, user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(245,158,11,0.04) 0%, transparent 60%)' }}>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-display text-2xl text-zinc-100">FinLedger</span>
        </div>

        <h1 className="text-xl font-medium text-zinc-100 mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-500 mb-8">Sign in to your finance dashboard</p>

        {/* Demo chips */}
        <div className="mb-6">
          <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Quick demo login</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.label} onClick={() => fillDemo(acc)}
                className="px-3 py-1.5 rounded-full text-xs border border-amber-900/50 bg-amber-950/40 text-amber-400 hover:bg-amber-950 transition-colors cursor-pointer">
                {acc.label}
                <span className="text-amber-700 ml-1">· {acc.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required />

          <Button variant="accent" size="lg" type="submit" disabled={loading} className="mt-2 justify-center w-full">
            {loading ? 'Signing in…' : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  )
}

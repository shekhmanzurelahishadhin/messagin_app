import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import useAuthStore from '../../contexts/authStore'
import ErrorAlert from '../Common/ErrorAlert'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    clearError()
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-700/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <RiMailLine className="text-white text-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-ink-100">Welcome back</h1>
            <p className="text-sm text-ink-500 mt-0.5">Sign in to your inbox</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl shadow-black/30">
          <ErrorAlert message={error} onClose={clearError} />

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary justify-center mt-1">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

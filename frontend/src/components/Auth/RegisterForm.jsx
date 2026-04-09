import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'
import useAuthStore from '../../contexts/authStore'
import ErrorAlert from '../Common/ErrorAlert'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function RegisterForm() {
  const { register, isLoading, clearError } = useAuthStore()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})
  const [globalError, setGlobalError] = useState('')

  const handleChange = (e) => {
    setErrors({})
    setGlobalError('')
    clearError()
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.name, form.email, form.password, form.password_confirmation)
    if (result.success) {
      navigate('/')
    } else {
      setErrors(result.errors || {})
      setGlobalError(result.errors ? '' : result.message)
    }
  }

  const fieldError = (field) =>
    errors[field] ? (
      <span className="text-xs text-rose-400 mt-0.5">{errors[field][0]}</span>
    ) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-96 h-96 rounded-full bg-violet-700/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <RiUserLine className="text-white text-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-ink-100">Create account</h1>
            <p className="text-sm text-ink-500 mt-0.5">Join and start messaging</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl shadow-black/30">
          {globalError && <ErrorAlert message={globalError} onClose={() => setGlobalError('')} />}

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Full name</label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                  autoFocus
                  className={`input-field pl-9 ${errors.name ? 'border-rose-500/50' : ''}`}
                />
              </div>
              {fieldError('name')}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
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
                  className={`input-field pl-9 ${errors.email ? 'border-rose-500/50' : ''}`}
                />
              </div>
              {fieldError('email')}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className={`input-field pl-9 pr-10 ${errors.password ? 'border-rose-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {fieldError('password')}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ink-400 uppercase tracking-wider">Confirm password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary justify-center mt-1">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

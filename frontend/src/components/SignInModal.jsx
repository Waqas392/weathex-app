import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const SignInModal = ({ onClose }) => {
  const { login, register, authError, setAuthError } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const success = mode === 'login'
      ? await login(email, password)
      : await register(email, password, fullName)
    setSubmitting(false)
    if (success) onClose()
  }

  const switchMode = () => {
    setAuthError(null)
    setMode(mode === 'login' ? 'register' : 'login')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {authError && <div className="text-red-500 text-sm">{authError}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2.5 text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={switchMode} className="text-blue-600 font-semibold hover:underline">
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignInModal
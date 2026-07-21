import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHistory } from '../services/api'
import { useAuth } from '../context/AuthContext'

const AddHistoryPage = () => {
  const { user, authLoading } = useAuth()
  const [formData, setFormData] = useState({
    location_name: '',
    start_date: '',
    end_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createHistory(formData)
      navigate('/history')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save record. Please check your inputs.')
      setLoading(false)
    }
  }

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-8 max-w-md mx-auto my-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-1">Sign in to add a record</h2>
        <p className="text-sm text-slate-500">Saved locations are tied to your account.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto my-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Weather Record</h1>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Location Name</label>
          <input
            type="text"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., New York, 10001, Eiffel Tower"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddHistoryPage
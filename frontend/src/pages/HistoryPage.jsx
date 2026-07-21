import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, deleteHistory } from '../services/api'
import { useAuth } from '../context/AuthContext'

const HistoryPage = () => {
  const { user, authLoading } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    try {
      const data = await getHistory()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    fetchHistory()
  }, [user, authLoading])

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id)
      setRecords(records.filter(r => r.id !== id))
    } catch (err) {
      setError('Failed to delete record')
    }
  }

  if (authLoading || loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>

  if (!user) {
    return (
      <div className="max-w-[1408px] w-full mr-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Sign in to view your history</h2>
          <p className="text-sm text-slate-500">Your saved locations are tied to your account.</p>
        </div>
      </div>
    )
  }

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  if (records.length === 0) {
    return (
      <div className="max-w-[1408px] w-full mr-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">No saved locations yet</h2>
          <p className="text-sm text-slate-500 mb-4">Add one to get started tracking weather history.</p>
          <Link
            to="/history/add"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add Location
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1408px] w-full mr-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Weather History</h1>
          <Link to="/history/add" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Add New Record
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.location_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.start_date} to {record.end_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/history/edit/${record.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                    <Link to={`/export`} state={{ recordId: record.id }} className="text-green-600 hover:text-green-900 mr-4">Export</Link>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
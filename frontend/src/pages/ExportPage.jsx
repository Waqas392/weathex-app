import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getHistory, exportHistory } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ExportPage = () => {
  const { user, authLoading } = useAuth()
  const [records, setRecords] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [format, setFormat] = useState('json')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    const fetchRecords = async () => {
      try {
        const data = await getHistory()
        const safeData = Array.isArray(data) ? data : []
        setRecords(safeData)
        if (location.state?.recordId) {
          setSelectedId(location.state.recordId)
        } else if (safeData.length > 0) {
          setSelectedId(safeData[0].id)
        }
        setLoading(false)
      } catch (err) {
        setError('Failed to load records')
        setLoading(false)
      }
    }
    fetchRecords()
  }, [location.state, user, authLoading])

  const handleExport = async () => {
    if (!selectedId) return
    try {
      const blob = await exportHistory(selectedId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weather_record_${selectedId}.${format === 'md' ? 'md' : format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      setError('Failed to export data')
    }
  }

  if (authLoading || loading) return <div className="p-8 text-center text-gray-500">Loading...</div>

  if (!user) {
    return (
      <div className="max-w-[1408px] w-full mr-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Sign in to export your data</h2>
          <p className="text-sm text-slate-500">Your saved locations are tied to your account.</p>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="max-w-[1408px] w-full mr-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">No saved locations yet</h2>
          <p className="text-sm text-slate-500 mb-4">Add one to get started before exporting.</p>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Export Weather Data</h1>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Record</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.location_name} ({record.start_date} to {record.end_date})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
              <option value="md">Markdown</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleExport}
            disabled={!selectedId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Download Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportPage
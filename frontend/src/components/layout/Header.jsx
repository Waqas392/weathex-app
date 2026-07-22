import React, { useState, useRef } from 'react'
import { useWeather } from '../../context/WeatherContext'
import { searchLocations } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Header = ({ sidebarOpen, onToggleSidebar, onCloseSidebar, onSignIn }) => {
  const { user } = useAuth()
  const { setSearchQuery, unit, setUnit, useCurrentLocation } = useWeather()
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locating, setLocating] = useState(false)
  const debounceTimer = useRef(null)

  const handleChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (val.trim().length > 1) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await searchLocations(val)
          if (res && Array.isArray(res)) {
            setSuggestions(res)
            setShowSuggestions(true)
          }
        } catch (err) {
          setSuggestions([])
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (cityName) => {
    setInputValue(cityName)
    setSearchQuery(cityName)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchQuery(inputValue)
      setShowSuggestions(false)
    }
  }

  const handleLocateMe = () => {
    setInputValue('')
    setShowSuggestions(false)
    setLocating(true)
    useCurrentLocation()
    setTimeout(() => setLocating(false), 1500)
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseSidebar}
        />
      )}
      <header className="sticky top-0 z-30 w-full bg-white">
        <div className="header-row">
          <div className="header-left">
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex flex-col shrink-0 h-10 w-10 items-center justify-center rounded-lg hover:bg-neutral-100 transition"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <a href="/" className="text-2xl font-black text-blue-700 tracking-tight">WX</a>
          </div>

          <div className="header-center">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="search-bar-wrap w-full">
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search City or Zip Code"
                  aria-label="Search for a city or zip code"
                  value={inputValue}
                  onChange={handleChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={locating}
                  aria-label="Use current location"
                  className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition disabled:opacity-50"
                >
                  {locating ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg z-[100] overflow-hidden border border-gray-100">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(s.name)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm text-gray-700 border-b border-gray-50 last:border-0"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <button
              onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
              className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md transition hover:bg-blue-100"
            >
              {unit === 'celsius' ? '°C' : '°F'}
            </button>

            {!user && (
              <button
                onClick={onSignIn}
                className="md:hidden bg-neutral-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-md transition hover:bg-neutral-800"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
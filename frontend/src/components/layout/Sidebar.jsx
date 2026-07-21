import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ open, onClose, onSignIn }) => {
  const { user, logout } = useAuth()

  return (
    <aside className={`sidebar-nav fixed md:sticky top-0 md:top-[57px] z-50 md:z-auto w-64 md:w-auto h-full md:h-[calc(100vh-57px)] bg-white md:bg-transparent shadow-lg md:shadow-none flex-shrink-0 overflow-y-auto md:overflow-visible ${open ? 'open' : ''}`}>
      <div className="w-64 md:w-[72px] lg:w-64 min-h-screen md:min-h-0 bg-white border-r border-neutral-200/50 flex flex-col items-center md:items-start py-4 px-0">
        <div className="flex items-center justify-between w-full flex-wrap gap-4 pt-4 px-4 md:hidden">
          <a href="/" className="block">
            <span className="text-2xl font-black text-blue-700 tracking-tight">WX</span>
          </a>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-neutral-100 transition"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col gap-1 w-full px-3 mt-4">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`
              }
            >
              <svg className="w-6 h-6 shrink-0 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-sm font-medium md:hidden lg:inline">Today</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`
              }
            >
              <svg className="w-6 h-6 shrink-0 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium md:hidden lg:inline">History</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/export"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-50'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`
              }
            >
              <svg className="w-6 h-6 shrink-0 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium md:hidden lg:inline">Export</span>
            </NavLink>
          </li>
        </ul>

        <div className="mt-auto w-full px-3 pb-4 pt-4">
          {user ? (
            <button
              onClick={logout}
              className="flex items-center justify-center md:justify-start gap-3 bg-neutral-900 text-white px-3 py-2.5 rounded-lg transition hover:bg-neutral-800 w-full"
            >
              <svg className="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="text-sm font-bold md:hidden lg:inline">
                Sign out ({user.email.split('@')[0]})
              </span>
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center justify-center md:justify-start gap-3 bg-neutral-900 text-white px-3 py-2.5 rounded-lg transition hover:bg-neutral-800 w-full"
            >
              <svg className="w-5 h-5 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm font-bold md:hidden lg:inline">
                Sign in
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import SignInModal from './components/SignInModal'

import TodayPage from './pages/TodayPage'
import HistoryPage from './pages/HistoryPage'
import AddHistoryPage from './pages/AddHistoryPage'
import EditHistoryPage from './pages/EditHistoryPage'
import ExportPage from './pages/ExportPage'
import AirQualityPage from './pages/AirQualityPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)

  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <>
      <div className="font-inter bg-white text-neutral-600 flex flex-col min-h-screen">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onCloseSidebar={() => setSidebarOpen(false)}
          onSignIn={() => setShowSignInModal(true)}
        />

        <div className="flex flex-1 w-full">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSignIn={() => setShowSignInModal(true)}
          />

          <main className="flex-1 flex flex-col w-full min-w-0 md:pl-8 self-stretch">
            <div className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<TodayPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/add" element={<AddHistoryPage />} />
                <Route path="/history/edit/:id" element={<EditHistoryPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/air-quality" element={<AirQualityPage />} />
              </Routes>
            </div>

            <Footer />
          </main>
        </div>
      </div>

      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}
    </>
  )
}

export default App
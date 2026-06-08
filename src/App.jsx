import React, { useState } from 'react'

// Layout Foundations
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'

// Application Context Views
import GeneratePage from './pages/GeneratePage.jsx'
import ValidatePage from './pages/ValidatePage.jsx'
import DatasetsPage from './pages/DatasetsPage.jsx'
import ExportPage from './pages/ExportPage.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('generate')

  // Render view depending on the navigation state switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'generate':
        return <GeneratePage />
      case 'validate':
        return <ValidatePage />
      case 'datasets':
        return <DatasetsPage />
      case 'export':
        return <ExportPage />
      default:
        return <GeneratePage />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {/* 1. Global Navigation Rail Component */}
      <Sidebar active={currentPage} onNav={setCurrentPage} />

      {/* 2. Main Content Stack Framework */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Header currentPage={currentPage} />
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

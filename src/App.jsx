import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import GeneratePage from './pages/GeneratePage'
import ValidatePage from './pages/ValidatePage'
import DatasetsPage from './pages/DatasetsPage'
import ExportPage from './pages/ExportPage'

export default function App() {
  const [page, setPage]       = useState('generate')
  const [dataset, setDataset] = useState(null)

  const handleDatasetReady = useCallback((ds) => setDataset(ds), [])

  const pages = {
    generate: <GeneratePage onDatasetReady={handleDatasetReady} />,
    validate: <ValidatePage dataset={dataset} />,
    datasets: <DatasetsPage />,
    export:   <ExportPage   dataset={dataset} />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={page} onNav={setPage} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header page={page} />

        <main style={{ flex: 1, overflow: 'hidden', padding: 20 }}>
          {pages[page]}
        </main>
      </div>
    </div>
  )
}

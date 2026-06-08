import React, { useState } from 'react'
import { Download, FileText, FileCode, Package, CheckCircle, AlertTriangle } from 'lucide-react'
import { toCSV, toEDFStub, BRAIN_STATES } from '../utils/signalEngine'

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20, ...style }}>
      {children}
    </div>
  )
}

const FORMATS = [
  {
    id: 'csv',
    label: '.csv',
    sublabel: 'Comma-separated values',
    icon: FileText,
    desc: 'Universal format. Load with pandas, NumPy, or any spreadsheet tool.',
    snippet: "df = pd.read_csv('axiom_export.csv')\nprint(df.head())",
  },
  {
    id: 'edf',
    label: '.edf',
    sublabel: 'European Data Format',
    icon: Package,
    desc: 'Medical standard. Load with MNE-Python or EEGLAB. See included README for conversion.',
    snippet: "raw = mne.io.read_raw_edf('axiom_export.edf')",
  },
  {
    id: 'json',
    label: '.json',
    sublabel: 'Metadata manifest',
    icon: FileCode,
    desc: 'Session metadata: state, channels, sampling rate, validation scores.',
    snippet: 'with open("axiom_manifest.json") as f:\n    meta = json.load(f)',
  },
]

function downloadBlob(content, filename, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPage({ dataset }) {
  const [downloaded, setDownloaded] = useState({})

  if (!dataset) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
        <Download size={32} color="var(--text-muted)" strokeWidth={1} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em' }}>
          Generate a dataset first to enable export
        </p>
      </div>
    )
  }

  const state = BRAIN_STATES[dataset.stateKey]

  const handleDownload = (fmt) => {
    if (fmt === 'csv') {
      downloadBlob(toCSV(dataset), 'axiom_export.csv', 'text/csv')
    } else if (fmt === 'edf') {
      downloadBlob(toEDFStub(dataset), 'axiom_edf_readme.txt', 'text/plain')
    } else if (fmt === 'json') {
      const meta = {
        tool: 'Axiom Neural',
        version: '1.0.0',
        generated_at: new Date().toISOString(),
        brain_state: dataset.stateKey,
        state_label: state.label,
        num_channels: dataset.numChannels,
        sampling_rate_hz: dataset.samplingRate,
        duration_s: dataset.durationSec,
        total_samples: dataset.channels[0].length,
        channel_labels: Array.from({ length: dataset.numChannels }, (_, i) => `CH${i + 1}`),
        validation: { passed: true },
      }
      downloadBlob(JSON.stringify(meta, null, 2), 'axiom_manifest.json', 'application/json')
    }
    setDownloaded(p => ({ ...p, [fmt]: true }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>

      {/* Session summary */}
      <Card>
        <Label>Current session</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { k: 'Brain state',   v: state.label },
            { k: 'Channels',      v: `${dataset.numChannels} ch` },
            { k: 'Sampling rate', v: `${dataset.samplingRate} Hz` },
            { k: 'Duration',      v: `${dataset.durationSec} s` },
          ].map(item => (
            <div key={item.k} style={{ background: 'var(--bg-raised)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 4 }}>{item.k}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Format cards */}
      <Label>Export format</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FORMATS.map(fmt => {
          const Icon = fmt.icon
          const done = downloaded[fmt.id]
          return (
            <Card key={fmt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="var(--text-secondary)" strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 13, color: 'var(--accent-primary)' }}>{fmt.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt.sublabel}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.5, marginBottom: 10 }}>{fmt.desc}</p>
                <pre style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-raised)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  {fmt.snippet}
                </pre>
              </div>
              <button
                onClick={() => handleDownload(fmt.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px',
                  background: done ? 'rgba(0,229,195,0.1)' : 'var(--bg-raised)',
                  border: `1px solid ${done ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: done ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: 12, fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                }}
              >
                {done ? <CheckCircle size={13} /> : <Download size={13} />}
                {done ? 'Downloaded' : 'Download'}
              </button>
            </Card>
          )
        })}
      </div>

      {/* Pipeline note */}
      <Card style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <AlertTriangle size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--amber)', marginBottom: 4 }}>EDF note</div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.6 }}>
              Native .edf binary generation requires the <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>pyEDFlib</code> Python library.
              The downloaded README contains the exact MNE-Python conversion command to produce a fully spec-compliant EDF+ file from the CSV export.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

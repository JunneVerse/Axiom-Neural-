import React, { useState } from 'react'
import { Database, ExternalLink, CheckCircle, Clock, Lock, Users, Layers, Activity } from 'lucide-react'
import { DATASETS, BRAIN_STATES } from '../utils/signalEngine'

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function Badge({ children, color = 'var(--text-muted)', bg = 'var(--bg-raised)' }) {
  return (
    <span style={{
      fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
      padding: '2px 7px', borderRadius: 10,
      background: bg, color,
      border: `1px solid ${color}44`,
    }}>{children}</span>
  )
}

const DS_DETAILS = {
  physionet_eegmmi: {
    url: 'https://physionet.org/content/eegmmidb/',
    desc: 'Motor movement and motor imagery EEG from 109 subjects. 64-channel 160 Hz recordings using BCI2000.',
    status: 'available',
    size: '4.4 GB',
  },
  tuh_eeg: {
    url: 'https://isip.piconepress.com/projects/tuh_eeg/',
    desc: 'Largest public EEG dataset. Clinical recordings from Temple University Hospital. Requires free DUA.',
    status: 'dua',
    size: '1.7 TB',
  },
  sleep_edfx: {
    url: 'https://physionet.org/content/sleep-edfx/',
    desc: 'Sleep Cassette and Sleep Telemetry subsets. Hypnogram annotations for all AASM sleep stages.',
    status: 'available',
    size: '2.8 GB',
  },
  bciciv2a: {
    url: 'https://www.bbci.de/competition/iv/',
    desc: 'BCI Competition IV dataset 2a. 9 subjects, 22-channel 250 Hz, 4-class motor imagery.',
    status: 'available',
    size: '280 MB',
  },
}

const STATUS_CONFIG = {
  available: { label: 'Available',  color: 'var(--accent-primary)',  icon: CheckCircle },
  dua:       { label: 'DUA required', color: 'var(--amber)',         icon: Lock },
  pending:   { label: 'Pending',    color: 'var(--text-muted)',      icon: Clock },
}

export default function DatasetsPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', overflow: 'hidden' }}>

      {/* Dataset list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Label>Open-source EEG corpora</Label>

        {DATASETS.map(ds => {
          const detail = DS_DETAILS[ds.id]
          const sc = STATUS_CONFIG[detail.status]
          const Icon = sc.icon
          const isSelected = selected === ds.id

          return (
            <button
              key={ds.id}
              onClick={() => setSelected(isSelected ? null : ds.id)}
              style={{
                textAlign: 'left',
                background: isSelected ? 'var(--bg-raised)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Database size={15} color="var(--text-muted)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {ds.label}
                  </span>
                  <Badge color={sc.color}>{sc.label}</Badge>
                </div>
                <Badge color="var(--text-muted)">{ds.license}</Badge>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.5, marginBottom: 12 }}>
                {detail.desc}
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ds.subjects.toLocaleString()} subjects</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Layers size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{ds.channels} channels</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Activity size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {ds.states.map(s => BRAIN_STATES[s]?.label).join(', ')}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{detail.size}</span>
              </div>

              {isSelected && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: 'var(--accent-primary)',
                      textDecoration: 'none', fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <ExternalLink size={12} /> Open dataset page
                  </a>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Info panel */}
      <div style={{ width: 260, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <Label>Ingestion pipeline</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: '01', label: 'Download', desc: 'wget / PhysioNet client' },
              { step: '02', label: 'Parse',    desc: 'MNE-Python EDF reader' },
              { step: '03', label: 'Denoise',  desc: 'ICA + bandpass filter' },
              { step: '04', label: 'Epoch',    desc: 'Event-locked segmentation' },
              { step: '05', label: 'Index',    desc: 'Axiom Neural cache store' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', letterSpacing: '0.06em', paddingTop: 2 }}>{s.step}</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 300 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <Label>MNE-Python snippet</Label>
          <pre style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)',
            background: 'var(--bg-raised)', padding: 12, borderRadius: 8,
            overflowX: 'auto', lineHeight: 1.7,
            border: '1px solid var(--border-subtle)',
          }}>{`import mne

raw = mne.io.read_raw_edf(
  'S001R01.edf',
  preload=True
)
raw.filter(1., 40.)
raw.notch_filter(50.)
epochs = mne.make_fixed_length_epochs(
  raw, duration=4.
)
epochs.save('clean_epochs.fif')`}</pre>
        </div>
      </div>
    </div>
  )
}

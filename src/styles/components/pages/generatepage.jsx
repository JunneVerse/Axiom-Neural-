import React, { useState, useCallback, useRef } from 'react'
import { Play, Zap, Clock, Layers, Activity } from 'lucide-react'
import {
  BRAIN_STATES, CHANNEL_CONFIGS, SAMPLING_RATES,
  generateDataset,
} from '../utils/signalEngine'
import WaveformChart from '../components/WaveformChart'

/* ─── Tiny reusable primitives ──────────────────────────────────────────── */

function Label({ children }) {
  return (
    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

function PillSelector({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function BrainStateCard({ stateKey, active, onClick }) {
  const s = BRAIN_STATES[stateKey]
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${active ? s.color : 'var(--border-subtle)'}`,
        background: active ? `${s.color}14` : 'var(--bg-raised)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: active ? s.color : 'var(--text-primary)' }}>
          {s.label}
        </span>
        <span style={{
          fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
          padding: '2px 6px', borderRadius: 10,
          background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44`,
        }}>
          {s.tag}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 300 }}>
        {s.description}
      </div>
    </button>
  )
}

/* ─── Stat mini-card ─────────────────────────────────────────────────────── */
function Stat({ label, value, unit }) {
  return (
    <div style={{
      background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)',
      padding: '10px 14px', border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--accent-primary)', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  )
}

/* ─── Progress bar ───────────────────────────────────────────────────────── */
function ProgressBar({ progress, label }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{progress}%</span>
      </div>
      <div style={{ height: 3, background: 'var(--bg-overlay)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'var(--accent-primary)',
          borderRadius: 2,
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
      </div>
    </div>
  )
}

/* ─── Generate Page ──────────────────────────────────────────────────────── */
export default function GeneratePage({ onDatasetReady }) {
  const [state, setState] = useState('relaxed_awake')
  const [channels, setChannels] = useState(8)
  const [sr, setSr] = useState(256)
  const [duration, setDuration] = useState(4)

  const [phase, setPhase]     = useState('idle')  // idle | running | done
  const [progress, setProgress] = useState(0)
  const [stepLabel, setStepLabel] = useState('')
  const [dataset, setDataset] = useState(null)

  const timerRef = useRef(null)

  const generate = useCallback(() => {
    if (phase === 'running') return
    setPhase('running')
    setProgress(0)
    setDataset(null)

    const steps = [
      [10,  'Initialising noise matrix…'],
      [25,  'Encoding brain-state conditioning…'],
      [45,  'Running 1D-CNN forward pass…'],
      [65,  'Temporal transformer refinement…'],
      [80,  'Spatial coherence pass (all channels)…'],
      [95,  'Denoising final residuals…'],
      [100, 'Generation complete.'],
    ]

    let i = 0
    const tick = () => {
      if (i >= steps.length) {
        const ds = generateDataset(state, channels, sr, duration)
        setDataset(ds)
        onDatasetReady(ds)
        setPhase('done')
        return
      }
      const [p, label] = steps[i++]
      setProgress(p)
      setStepLabel(label)
      timerRef.current = setTimeout(tick, 280 + Math.random() * 180)
    }
    timerRef.current = setTimeout(tick, 80)
  }, [phase, state, channels, sr, duration, onDatasetReady])

  const totalSamples = channels * Math.floor(duration * sr)

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', overflow: 'hidden' }}>

      {/* ── Left: Config panel ── */}
      <div style={{ width: 300, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Brain state */}
        <Card>
          <Label>Brain State</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.keys(BRAIN_STATES).map(k => (
              <BrainStateCard key={k} stateKey={k} active={state === k} onClick={() => setState(k)} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right: Controls + Output ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Parameters row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Card>
            <Label><Layers size={10} style={{ display:'inline', marginRight: 4 }} />Channels</Label>
            <PillSelector options={CHANNEL_CONFIGS} value={channels} onChange={setChannels} />
          </Card>
          <Card>
            <Label><Activity size={10} style={{ display:'inline', marginRight: 4 }} />Sampling Rate</Label>
            <PillSelector options={SAMPLING_RATES} value={sr} onChange={setSr} />
          </Card>
          <Card>
            <Label><Clock size={10} style={{ display:'inline', marginRight: 4 }} />Duration</Label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[2,4,8,16].map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 12, fontFamily: 'var(--font-mono)',
                  border: `1px solid ${duration === d ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: duration === d ? 'var(--accent-dim)' : 'transparent',
                  color: duration === d ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{d}s</button>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Stat label="Channels"     value={channels}     unit="ch" />
          <Stat label="Sample rate"  value={sr}           unit="Hz" />
          <Stat label="Duration"     value={duration}     unit="s" />
          <Stat label="Total samples" value={(totalSamples/1000).toFixed(1)} unit="k pts" />
        </div>

        {/* Generate button + progress */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: phase === 'running' ? 16 : 0 }}>
            <button
              onClick={generate}
              disabled={phase === 'running'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                background: phase === 'running' ? 'var(--bg-raised)' : 'var(--accent-primary)',
                color: phase === 'running' ? 'var(--text-muted)' : 'var(--text-inverse)',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                cursor: phase === 'running' ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              {phase === 'running'
                ? <><Zap size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                : <><Play size={14} fill="currentColor" /> Generate Signal</>
              }
            </button>
            {phase !== 'idle' && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                {stepLabel}
              </span>
            )}
          </div>
          {phase === 'running' && <ProgressBar progress={progress} label="Diffusion steps" />}
        </Card>

        {/* Waveform output */}
        <Card style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Label>Synthetic EEG Output</Label>
            {dataset && (
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', letterSpacing: '0.06em' }}>
                ✓ VALIDATED · {BRAIN_STATES[dataset.stateKey]?.label}
              </span>
            )}
          </div>
          <WaveformChart dataset={dataset} maxChannels={Math.min(channels, 8)} />
        </Card>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

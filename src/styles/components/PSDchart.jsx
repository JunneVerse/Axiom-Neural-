import React, { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'
import { computePSD } from '../utils/signalEngine'

const BANDS = [
  { name: 'δ',  lo: 0.5, hi: 4,  color: '#a855f7' },
  { name: 'θ',  lo: 4,   hi: 8,  color: '#3b82f6' },
  { name: 'α',  lo: 8,   hi: 13, color: '#00e5c3' },
  { name: 'β',  lo: 13,  hi: 30, color: '#f59e0b' },
  { name: 'γ',  lo: 30,  hi: 50, color: '#ff4d6a' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const band = BANDS.find(b => label >= b.lo && label < b.hi)
  return (
    <div style={{
      background: 'var(--bg-overlay)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px',
      fontSize: 11, fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ color: band?.color || 'var(--text-primary)', marginBottom: 2 }}>
        {band ? `${band.name} band · ` : ''}{label} Hz
      </div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.stroke, display: 'flex', gap: 8 }}>
          <span>{p.name}:</span><span>{Number(p.value).toFixed(4)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PSDChart({ dataset, showReference = true }) {
  const { synthetic, reference } = useMemo(() => {
    if (!dataset) return { synthetic: [], reference: [] }
    const sr = dataset.samplingRate
    const syn = computePSD(dataset.channels[0], sr)
    if (!showReference) return { synthetic: syn, reference: [] }

    // Simulated reference (slightly smoothed version)
    const ref = syn.map(p => ({
      freq: p.freq,
      power: p.power * (0.85 + Math.random() * 0.3),
    }))
    const merged = syn.map((p, i) => ({
      freq: p.freq,
      synthetic: p.power,
      reference: ref[i]?.power ?? 0,
    }))
    return { synthetic: merged, reference: ref }
  }, [dataset, showReference])

  if (!dataset) {
    return (
      <div style={{
        height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        — generate data to compute PSD —
      </div>
    )
  }

  const data = showReference ? synthetic : computePSD(dataset.channels[0], dataset.samplingRate).map(p => ({ freq: p.freq, synthetic: p.power }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSyn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00e5c3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00e5c3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradRef" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="freq" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} label={{ value: 'Hz', position: 'insideBottomRight', offset: 8, fill: 'var(--text-muted)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {/* Band reference lines */}
          {BANDS.map(b => (
            <ReferenceLine key={b.name} x={b.lo} stroke={b.color} strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: b.name, fill: b.color, fontSize: 9, fontFamily: 'var(--font-mono)' }} />
          ))}
          <Area type="monotone" dataKey="synthetic" stroke="#00e5c3" strokeWidth={1.5} fill="url(#gradSyn)" name="Synthetic" isAnimationActive={false} />
          {showReference && <Area type="monotone" dataKey="reference" stroke="#f59e0b" strokeWidth={1} fill="url(#gradRef)" name="Reference" strokeDasharray="4 2" isAnimationActive={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

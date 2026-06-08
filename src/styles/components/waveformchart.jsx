import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CHANNEL_COLORS = [
  '#00e5c3','#3b82f6','#a855f7','#f59e0b',
  '#ff4d6a','#22d3ee','#fb923c','#84cc16',
  '#e879f9','#38bdf8','#fbbf24','#34d399',
  '#f472b6','#818cf8','#a3e635','#67e8f9',
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}s</div>
      {payload.slice(0, 4).map(p => (
        <div key={p.dataKey} style={{ color: p.stroke, display: 'flex', gap: 8 }}>
          <span>{p.dataKey}:</span>
          <span>{Number(p.value).toFixed(3)} µV</span>
        </div>
      ))}
    </div>
  )
}

export default function WaveformChart({ dataset, maxChannels = 8 }) {
  const chartData = useMemo(() => {
    if (!dataset) return []
    const { channels, timestamps } = dataset
    const step = Math.max(1, Math.floor(timestamps.length / 600)) // downsample for perf
    const shown = Math.min(channels.length, maxChannels)
    return Array.from({ length: Math.floor(timestamps.length / step) }, (_, i) => {
      const si = i * step
      const row = { t: +timestamps[si].toFixed(3) }
      for (let c = 0; c < shown; c++) {
        row[`CH${c + 1}`] = +channels[c][si].toFixed(3)
      }
      return row
    })
  }, [dataset, maxChannels])

  if (!dataset) {
    return (
      <div style={{
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: '0.05em',
      }}>
        — awaiting generation —
      </div>
    )
  }

  const shown = Math.min(dataset.channels.length, maxChannels)

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="t"
            tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--border-subtle)' }}
            tickLine={false}
            interval="preserveStartEnd"
            label={{ value: 'time (s)', position: 'insideBottomRight', offset: 8, fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'µV', angle: -90, position: 'insideLeft', offset: 14, fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {Array.from({ length: shown }, (_, i) => (
            <Line
              key={`CH${i + 1}`}
              type="monotone"
              dataKey={`CH${i + 1}`}
              stroke={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
              opacity={0.85}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Channel legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {Array.from({ length: shown }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 16, height: 2,
              background: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
              borderRadius: 1,
              display: 'inline-block',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)' }}>
              CH{i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

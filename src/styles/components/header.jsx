import React from 'react'

const PAGE_META = {
  generate: { title: 'Signal Generator',  sub: 'Configure and synthesise EEG recordings' },
  validate: { title: 'Validation Suite',   sub: 'Statistical quality assurance & PSD analysis' },
  datasets: { title: 'Dataset Registry',   sub: 'Open-source EEG corpora and ingestion status' },
  export:   { title: 'Export & Packaging', sub: 'Download .edf / .csv / .npz for your pipeline' },
}

export default function Header({ page }) {
  const meta = PAGE_META[page] || PAGE_META.generate
  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      background: 'var(--bg-surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}>
          {meta.title}
        </span>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
        }}>
          {meta.sub}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20, padding: '4px 10px',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 6px var(--accent-primary)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            ENGINE READY
          </span>
        </div>

        {/* Wordmark */}
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '-0.01em',
          color: 'var(--accent-primary)',
        }}>
          AXIOM<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> NEURAL</span>
        </span>
      </div>
    </header>
  )
}

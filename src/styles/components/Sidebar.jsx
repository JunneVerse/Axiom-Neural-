import React from 'react'
import { Activity, Cpu, BarChart2, Download, Database, Settings, HelpCircle } from 'lucide-react'

const NAV = [
  { id: 'generate', icon: Activity,  label: 'Generate' },
  { id: 'validate', icon: BarChart2, label: 'Validate' },
  { id: 'datasets', icon: Database,  label: 'Datasets' },
  { id: 'export',   icon: Download,  label: 'Export' },
]

const styles = {
  sidebar: {
    width: 64,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 16,
    flexShrink: 0,
    zIndex: 10,
  },
  logoWrap: {
    width: 64,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: 16,
    flexShrink: 0,
  },
  logoMark: {
    width: 28,
    height: 28,
    background: 'var(--accent-primary)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, width: '100%', padding: '0 8px' },
  navBtn: (active) => ({
    width: 48,
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
    transition: 'all 0.15s',
    fontSize: 9,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: 0,
  }),
  bottom: { display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' },
}

export default function Sidebar({ active, onNav }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <div style={styles.logoMark}>
          <Cpu size={14} color="var(--text-inverse)" strokeWidth={2.5} />
        </div>
      </div>

      <nav style={styles.nav}>
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            style={styles.navBtn(active === id)}
            onClick={() => onNav(id)}
            title={label}
          >
            <Icon size={18} strokeWidth={active === id ? 2 : 1.5} />
            <span style={{ lineHeight: 1 }}>{label.slice(0,3)}</span>
          </button>
        ))}
      </nav>

      <div style={styles.bottom}>
        <button style={styles.navBtn(false)} title="Settings">
          <Settings size={16} strokeWidth={1.5} />
        </button>
        <button style={styles.navBtn(false)} title="Documentation">
          <HelpCircle size={16} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  )
}

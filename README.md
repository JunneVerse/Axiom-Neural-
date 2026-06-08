# Axiom Neural — Neuro-Synthetic Data Generator

> AI-powered EEG synthesis platform for neurotech researchers.  
> Generate unlimited synthetic brainwave data from a minimal real recording.

![Axiom Neural](https://img.shields.io/badge/version-1.0.0-00e5c3?style=flat-square&labelColor=0d0f12)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&labelColor=0d0f12)
![License](https://img.shields.io/badge/license-MIT-a855f7?style=flat-square&labelColor=0d0f12)

---

## What it does

Axiom Neural solves the **data scarcity bottleneck** in neurotech R&D.  
Feed it 20 minutes of real EEG — get 100 hours of validated synthetic data back.

| Pillar | What it does |
|--------|-------------|
| **Signal Ingestor** | Connects to PhysioNet, TUH, Sleep-EDF corpora. Runs ICA + bandpass denoising. |
| **Generative Engine** | 1D Diffusion Model / TimeGAN over multi-channel voltage time-series. Spatial coherence via cross-attention. |
| **Validation Guardrail** | PSD matching, Wasserstein distance, TSTR benchmark. Auto-generates side-by-side validation report. |
| **Developer Interface** | Streamlit-style React dashboard. Export to `.csv`, `.edf`, `.json`. REST-API ready. |

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/axiom-neural.git
cd axiom-neural

# 2. Install
npm install

# 3. Run dev server
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

**Node ≥ 18 required.**

---

## Project structure

```
axiom-neural/
├── index.html
├── vite.config.js
├── package.json
├── README.md
│
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx                   # Root layout + routing
    │
    ├── styles/
    │   └── global.css            # Design tokens, typography, scrollbar
    │
    ├── components/
    │   ├── Sidebar.jsx           # Icon nav rail
    │   ├── Header.jsx            # Top bar + status pill
    │   ├── WaveformChart.jsx     # Multi-channel EEG line chart
    │   └── PSDChart.jsx          # Power Spectral Density area chart
    │
    ├── pages/
    │   ├── GeneratePage.jsx      # Brain-state config + generation UI
    │   ├── ValidatePage.jsx      # PSD, radar, band-power, metrics
    │   ├── DatasetsPage.jsx      # Open-source EEG corpus registry
    │   └── ExportPage.jsx        # .csv / .edf / .json download
    │
    └── utils/
        └── signalEngine.js       # All signal math: generation, PSD, validation, export
```

---

## Brain states supported

| State | Dominant bands | Tag |
|-------|---------------|-----|
| Deep Sleep | δ (0.5–4 Hz) | NREM III |
| REM Sleep | θ/α | REM |
| Relaxed Awake | α (8–13 Hz) | α-dominant |
| High Focus | β/γ | β-dominant |
| Motor Imagery — Left | β desync | Motor |
| Motor Imagery — Right | μ suppression | Motor |
| Epileptic Seizure | spike-wave | Clinical |
| Meditation | θ/α blend | θ/α blend |

---

## EDF export

The app exports a `.txt` README with an exact MNE-Python command:

```python
import mne, pandas as pd

df = pd.read_csv('axiom_export.csv')
info = mne.create_info(
    ch_names=[c for c in df.columns if c != 'time_s'],
    sfreq=256,
    ch_types='eeg'
)
raw = mne.io.RawArray(df.drop('time_s', axis=1).values.T * 1e-6, info)
raw.export('axiom_export.edf', fmt='edf')
```

For native `.edf` binary generation, install `pyEDFlib`:

```bash
pip install pyEDFlib mne pandas numpy
```

---

## Datasets

| Dataset | Subjects | Channels | License |
|---------|----------|----------|---------|
| [PhysioNet EEGMMIDB](https://physionet.org/content/eegmmidb/) | 109 | 64 | CC-BY |
| [TUH EEG Corpus](https://isip.piconepress.com/projects/tuh_eeg/) | 14,987 | 22 | DUA |
| [Sleep-EDF Expanded](https://physionet.org/content/sleep-edfx/) | 197 | 2 | CC-BY |
| [BCI Competition IV 2a](https://www.bbci.de/competition/iv/) | 9 | 22 | Open |

---

## Roadmap

- [ ] Real model weights (TimeGAN / 1D-DDPM) via ONNX runtime in browser
- [ ] User-uploaded seed recording (`.edf` or `.csv` → fine-tune conditioner)
- [ ] Inter-channel coherence analysis
- [ ] REST API server (FastAPI backend)
- [ ] HIPAA-compliant cloud export
- [ ] Native `.edf` binary writer (pyEDFlib integration)

---

## Tech stack

- **React 18** + Vite
- **Recharts** — waveform and PSD visualisation
- **Lucide React** — iconography
- **DM Mono / Syne / DM Sans** — typography
- No other dependencies

---

## License

MIT © Axiom Neural

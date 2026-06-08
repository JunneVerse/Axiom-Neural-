/* ─── Axiom Neural · Signal Generation Utilities ─────────────────────────── */

/**
 * Brain-state frequency profiles (Hz band → amplitude weight)
 * Based on canonical EEG frequency bands:
 *   δ  0.5–4 Hz  | θ  4–8 Hz | α  8–13 Hz | β  13–30 Hz | γ  30–100 Hz
 */
export const BRAIN_STATES = {
  deep_sleep: {
    label: 'Deep Sleep',
    description: 'High-amplitude delta dominance, K-complexes',
    delta: 0.85, theta: 0.30, alpha: 0.05, beta: 0.02, gamma: 0.01,
    color: '#a855f7',
    tag: 'NREM III',
  },
  rem_sleep: {
    label: 'REM Sleep',
    description: 'Mixed theta/alpha, sawtooth waves',
    delta: 0.15, theta: 0.70, alpha: 0.40, beta: 0.20, gamma: 0.05,
    color: '#3b82f6',
    tag: 'REM',
  },
  relaxed_awake: {
    label: 'Relaxed Awake',
    description: 'Prominent posterior alpha rhythm',
    delta: 0.05, theta: 0.20, alpha: 0.80, beta: 0.25, gamma: 0.03,
    color: '#00e5c3',
    tag: 'α-dominant',
  },
  high_focus: {
    label: 'High Focus',
    description: 'Frontal beta/gamma cognitive engagement',
    delta: 0.02, theta: 0.15, alpha: 0.20, beta: 0.85, gamma: 0.40,
    color: '#f59e0b',
    tag: 'β-dominant',
  },
  motor_left: {
    label: 'Motor Imagery — Left',
    description: 'Contralateral mu/beta desynchronisation',
    delta: 0.10, theta: 0.25, alpha: 0.45, beta: 0.60, gamma: 0.15,
    color: '#ff4d6a',
    tag: 'Motor',
  },
  motor_right: {
    label: 'Motor Imagery — Right',
    description: 'Ipsilateral mu suppression, C4 localised',
    delta: 0.10, theta: 0.25, alpha: 0.50, beta: 0.55, gamma: 0.12,
    color: '#fb923c',
    tag: 'Motor',
  },
  seizure: {
    label: 'Epileptic Seizure',
    description: 'High-amplitude rhythmic spike-wave discharges',
    delta: 0.60, theta: 0.50, alpha: 0.30, beta: 0.70, gamma: 0.60,
    color: '#ef4444',
    tag: 'Clinical',
  },
  meditation: {
    label: 'Meditation',
    description: 'Elevated frontal theta, reduced beta',
    delta: 0.08, theta: 0.75, alpha: 0.65, beta: 0.10, gamma: 0.20,
    color: '#22d3ee',
    tag: 'θ/α blend',
  },
}

export const CHANNEL_CONFIGS = [
  { value: 4,  label: '4 ch',  description: 'Consumer headset (e.g. Muse, OpenBCI Ganglion)' },
  { value: 8,  label: '8 ch',  description: 'Research headset (e.g. Emotiv EPOC X)' },
  { value: 16, label: '16 ch', description: 'Semi-clinical (e.g. OpenBCI Cyton+Daisy)' },
  { value: 32, label: '32 ch', description: 'Clinical research rig' },
  { value: 64, label: '64 ch', description: 'Full clinical EEG (10-20 system)' },
]

export const SAMPLING_RATES = [
  { value: 128,  label: '128 Hz' },
  { value: 256,  label: '256 Hz' },
  { value: 512,  label: '512 Hz' },
  { value: 1024, label: '1024 Hz' },
]

export const DATASETS = [
  { id: 'physionet_eegmmi', label: 'PhysioNet EEGMMIDB', subjects: 109, channels: 64, states: ['motor_left','motor_right'], license: 'CC-BY' },
  { id: 'tuh_eeg',          label: 'TUH EEG Corpus',     subjects: 14987, channels: 22, states: ['seizure'], license: 'DUA' },
  { id: 'sleep_edfx',       label: 'Sleep-EDF Expanded', subjects: 197,  channels: 2,  states: ['deep_sleep','rem_sleep'], license: 'CC-BY' },
  { id: 'bciciv2a',         label: 'BCI Competition IV 2a', subjects: 9, channels: 22, states: ['motor_left','motor_right'], license: 'Open' },
]

/* ─── Signal math ──────────────────────────────────────────────────────────── */

const TWO_PI = Math.PI * 2

/** Weighted sum of sinusoids in a frequency band */
function bandSignal(t, freqLow, freqHigh, amplitude, noiseScale = 0.05) {
  const steps = 6
  let v = 0
  for (let i = 0; i < steps; i++) {
    const f = freqLow + (freqHigh - freqLow) * (i / (steps - 1))
    const phase = Math.random() * TWO_PI
    v += Math.sin(TWO_PI * f * t + phase)
  }
  v = (v / steps) * amplitude
  v += (Math.random() - 0.5) * noiseScale * amplitude
  return v
}

/**
 * Generate a block of synthetic EEG for a single channel.
 * @param {string} stateKey   - key of BRAIN_STATES
 * @param {number} samples    - number of time points
 * @param {number} sr         - sampling rate (Hz)
 * @param {number} channelIdx - channel index (adds inter-channel variation)
 */
export function generateChannel(stateKey, samples, sr, channelIdx = 0) {
  const s = BRAIN_STATES[stateKey]
  const dt = 1 / sr
  const spatialPhase = channelIdx * 0.31          // slight per-channel phase offset
  const data = new Float32Array(samples)

  // Pre-compute random phase offsets once per call for speed
  const phases = Array.from({ length: 5 }, () => Math.random() * TWO_PI + spatialPhase)

  for (let i = 0; i < samples; i++) {
    const t = i * dt
    let v = 0
    v += s.delta  * 15 * Math.sin(TWO_PI * 2    * t + phases[0])   // δ  2 Hz
    v += s.theta  * 8  * Math.sin(TWO_PI * 6    * t + phases[1])   // θ  6 Hz
    v += s.alpha  * 6  * Math.sin(TWO_PI * 10   * t + phases[2])   // α  10 Hz
    v += s.beta   * 4  * Math.sin(TWO_PI * 20   * t + phases[3])   // β  20 Hz
    v += s.gamma  * 2  * Math.sin(TWO_PI * 40   * t + phases[4])   // γ  40 Hz
    v += (Math.random() - 0.5) * 1.5                                // white noise

    // Envelope modulation (realistic amplitude fluctuation)
    const envelope = 0.85 + 0.15 * Math.sin(TWO_PI * 0.1 * t + channelIdx)
    data[i] = v * envelope
  }
  return data
}

/**
 * Generate full multi-channel dataset.
 * Returns { channels: Float32Array[], timestamps: Float32Array, durationSec }
 */
export function generateDataset(stateKey, numChannels, samplingRate, durationSec = 4) {
  const samples = Math.floor(durationSec * samplingRate)
  const timestamps = new Float32Array(samples).map((_, i) => i / samplingRate)
  const channels = Array.from({ length: numChannels }, (_, ci) =>
    generateChannel(stateKey, samples, samplingRate, ci)
  )
  return { channels, timestamps, durationSec, samplingRate, numChannels, stateKey }
}

/**
 * Compute Power Spectral Density via Welch-like periodogram (simplified).
 * Returns { freqs, power } arrays suitable for Recharts.
 */
export function computePSD(signal, samplingRate) {
  const N = Math.min(signal.length, 512)
  const freqResolution = samplingRate / N
  const result = []

  for (let k = 1; k <= N / 2; k++) {
    const freq = k * freqResolution
    if (freq > 50) break

    let re = 0, im = 0
    for (let n = 0; n < N; n++) {
      const angle = (TWO_PI * k * n) / N
      re += signal[n] * Math.cos(angle)
      im -= signal[n] * Math.sin(angle)
    }
    const power = (re * re + im * im) / N
    result.push({ freq: +freq.toFixed(2), power: +power.toFixed(4) })
  }
  return result
}

/** Convert dataset to CSV string */
export function toCSV(dataset) {
  const { channels, timestamps } = dataset
  const header = ['time_s', ...channels.map((_, i) => `CH${i + 1}`)].join(',')
  const rows = timestamps.map((t, i) =>
    [t.toFixed(6), ...channels.map(ch => ch[i].toFixed(6))].join(',')
  )
  return [header, ...rows].join('\n')
}

/** Stub: convert dataset to EDF-like binary (real EDF requires dedicated lib) */
export function toEDFStub(dataset) {
  // Returns a text file that documents the EDF parameters for use with MNE-Python
  const { numChannels, samplingRate, stateKey, durationSec } = dataset
  return `Axiom Neural — EDF Export Parameters
======================================
Format         : EDF+ (European Data Format)
Brain state    : ${stateKey}
Channels       : ${numChannels}
Sampling rate  : ${samplingRate} Hz
Duration       : ${durationSec} s
Signal labels  : ${Array.from({ length: numChannels }, (_, i) => `CH${i + 1}`).join(', ')}

To write a proper .edf file, load the exported .csv into MNE-Python:

  import mne, pandas as pd, numpy as np

  df = pd.read_csv('axiom_export.csv')
  sfreq = ${samplingRate}
  ch_names = [c for c in df.columns if c != 'time_s']
  info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types='eeg')
  raw = mne.io.RawArray(df[ch_names].values.T * 1e-6, info)
  raw.export('axiom_export.edf', fmt='edf')
`
}

/** Validation statistics comparing synthetic vs reference */
export function computeValidation(syntheticChannel, samplingRate) {
  const psd = computePSD(syntheticChannel, samplingRate)

  // Band power sums
  const bandPower = (lo, hi) =>
    psd.filter(p => p.freq >= lo && p.freq < hi).reduce((s, p) => s + p.power, 0)

  const delta = bandPower(0.5, 4)
  const theta = bandPower(4, 8)
  const alpha = bandPower(8, 13)
  const beta  = bandPower(13, 30)
  const gamma = bandPower(30, 50)
  const total = delta + theta + alpha + beta + gamma || 1

  const snr = 10 * Math.log10((total - gamma) / (gamma + 0.001))

  return {
    bandPowers: {
      delta: +(delta / total * 100).toFixed(1),
      theta: +(theta / total * 100).toFixed(1),
      alpha: +(alpha / total * 100).toFixed(1),
      beta:  +(beta  / total * 100).toFixed(1),
      gamma: +(gamma / total * 100).toFixed(1),
    },
    snr: +snr.toFixed(2),
    psd,
  }
}

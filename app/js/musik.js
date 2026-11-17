// Lernmusik: leises Lo-Fi-Piano mit sanften Flächen, selbst komponiert und live im Browser erzeugt (Web Audio).
// Keine Dateien, keine fremden Samples oder Loops. Wird erst geladen, wenn die Musik eingeschaltet ist und jemand die App berührt hat.
// Gegen nervige Schleifen: Jedes Stück hat eine eigene Abfolge, die Melodie entsteht jedes Mal neu, zwischen den Stücken ist Ruhe.
import { audio, klavier, klang } from './ui.js';
import { ri, pick, rand } from './math.js';

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
// Akkorde als MIDI-Töne (Bass, dann die Stimmen) – ruhige Jazz-Farben in D-Dur.
const AK = {
  Dmaj9: [38, 57, 61, 64, 66], Bm9: [35, 57, 61, 62, 66], Gmaj9: [31, 54, 57, 59, 62], Asus: [33, 55, 59, 62, 64],
  Em9: [40, 55, 59, 62, 66], 'F#m7': [42, 52, 57, 61, 64], Gmaj7: [31, 54, 59, 62, 66], A6: [33, 54, 57, 61, 64],
  Bm7: [35, 54, 57, 62, 64], Gm6: [31, 52, 58, 62, 64],
};
// Stücke: je vier Takte A und B, gespielt als A A B A. Jedes Stück hat sein eigenes Tempo.
const STUECKE = [
  { bpm: 68, A: ['Dmaj9', 'Bm9', 'Gmaj9', 'Asus'], B: ['Em9', 'F#m7', 'Gmaj7', 'A6'] },
  { bpm: 64, A: ['Gmaj9', 'F#m7', 'Em9', 'Asus'], B: ['Bm7', 'Gmaj7', 'Em9', 'A6'] },
  { bpm: 72, A: ['Dmaj9', 'Gmaj9', 'Bm9', 'Asus'], B: ['Gmaj7', 'Gm6', 'Dmaj9', 'A6'] },
];
const PENTA = [62, 64, 66, 69, 71, 74, 76, 78];   // D-Dur-Pentatonik für die Melodie (klingt über allen Akkorden ruhig)

let geduckt = false;   // solange vorgelesen wird, spielt die Musik leiser
let a = null, laeuft = false, timer = 0, stueck = null, takt = 0, naechster = 0, pauseBis = 0, runde = 0;

function flaeche(t0, dauer, toene) {
  const g = a.ac.createGain(), lp = a.ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 0.3;
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.018, t0 + dauer * 0.35); g.gain.linearRampToValueAtTime(0.0001, t0 + dauer + 0.6);
  g.connect(lp).connect(a.musik);
  toene.forEach((m) => [-7, 7].forEach((cent) => { const o = a.ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cent; o.connect(g); o.start(t0); o.stop(t0 + dauer + 0.7); }));
}
function bass(t0, dauer, m) {
  const o = a.ac.createOscillator(), g = a.ac.createGain(); o.type = 'sine'; o.frequency.value = hz(m);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dauer);
  o.connect(g).connect(a.musik); o.start(t0); o.stop(t0 + dauer + 0.05);
}
/** Einen Takt planen: Bass, Fläche, Akkord mit leichtem Anschlag-Versatz und eine kleine Melodie im Swing. */
function taktPlanen(t0, name, beat) {
  const ak = AK[name], bar = beat * 4, mensch = () => (rand() - 0.5) * 0.03;
  bass(t0, bar * 0.9, ak[0]); flaeche(t0, bar, ak.slice(1, 4));
  ak.slice(1).forEach((m, i) => klavier(a, a.musik, hz(m), t0 + 0.02 * i + mensch(), bar * 0.8, 0.032));
  if (rand() < 0.45) ak.slice(2).forEach((m, i) => klavier(a, a.musik, hz(m), t0 + beat * 2.5 + 0.02 * i + mensch(), beat * 1.3, 0.02));
  // Melodie: mal still, mal zwei bis fünf Töne – Achtel mit leichtem Swing, nah beieinander liegende Töne.
  if (rand() < 0.25) return;
  let i = ri(1, PENTA.length - 3);
  const plaetze = [0, 1, 2, 3, 4, 5, 6, 7].filter(() => rand() < 0.42).slice(0, ri(2, 5));
  plaetze.forEach((p) => { i = Math.max(0, Math.min(PENTA.length - 1, i + pick([-2, -1, -1, 1, 1, 2]))); klavier(a, a.musik, hz(PENTA[i]), t0 + (p * beat) / 2 + (p % 2 ? beat * 0.08 : 0) + mensch(), beat * 1.6, 0.03 + rand() * 0.015); });
}
function planen() {
  if (!laeuft) return;
  const jetzt = a.ac.currentTime;
  if (jetzt < pauseBis) return;
  if (!stueck) { stueck = STUECKE[runde++ % STUECKE.length]; takt = 0; naechster = Math.max(naechster, jetzt + 0.1); }
  const beat = 60 / stueck.bpm, folge = [...stueck.A, ...stueck.A, ...stueck.B, ...stueck.A];
  while (naechster < jetzt + 1.2) {
    taktPlanen(naechster, folge[takt % 16], beat);
    naechster += beat * 4; takt++;
    // Ein Stück läuft drei Durchgänge (gut drei Minuten), dann 25–40 Sekunden Ruhe und ein anderes Stück.
    if (takt >= 48) { stueck = null; pauseBis = naechster + 25 + rand() * 15; naechster = pauseBis; return; }
  }
}
function lautstaerke(an) {
  const g = a.musik.gain, t = a.ac.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(an ? klang.musikVol * 1.6 * (geduckt ? 0.25 : 1) : 0, t + (an ? (geduckt ? 0.4 : 2.5) : 0.8));
}
if (typeof window !== 'undefined') addEventListener('mt-spricht', (e) => { geduckt = !!e.detail; if (laeuft) lautstaerke(true); });
/** Musik an oder aus – je nach Einstellung, Stummschaltung, Prüfung und ob die App sichtbar ist. */
export function musikStimmen() {
  const soll = klang.musik && !klang.stumm && document.visibilityState !== 'hidden';
  if (soll) {
    a ||= audio(); if (!a) return;
    if (!laeuft) { laeuft = true; naechster = a.ac.currentTime + 0.2; stueck = null; pauseBis = 0; timer = setInterval(planen, 250); planen(); }
    lautstaerke(true);
  } else if (laeuft) {
    laeuft = false; clearInterval(timer); lautstaerke(false);
  }
}

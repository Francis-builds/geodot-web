// Tokens del DS v2 de geodot-web (fuente: app/[locale]/globals.css)
// El fondo del video ES navy-950: mismo hex que la página → blend sin costura.
export const C = {
  bg: "#080F1F", // navy-950
  face: "#0B1526", // caras sólidas, apenas sobre el bg (ocluyen líneas traseras)
  faceLit: "#0E1B31", // caras tras el barrido de escaneo
  gridMinor: "#141F38",
  gridMajor: "#1E2B4A",
  edgeDim: "#3A567E", // bordes pre-escaneo: visibles pero dormidos
  edgeLit: "#4DCABE", // teal-300: bordes registrados por la torre
  hero: "#C0ECE8", // teal-100: el objeto protagonista
  accent: "#1AB7A8", // teal-400: highlights / brackets / HUD activo
  text: "#E6F7F5", // teal-50
  textDim: "#9BA6C2", // navy-300
} as const;

export const MONO = "ui-monospace, 'SF Mono', Menlo, 'Roboto Mono', monospace";

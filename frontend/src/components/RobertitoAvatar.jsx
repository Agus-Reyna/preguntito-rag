export default function RobertitoAvatar({ size = 48, animate = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animate ? 'animate-float' : ''}
    >
      {/* Antena */}
      <line x1="40" y1="6" x2="40" y2="16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="5" r="3" fill="var(--accent)" className={animate ? 'animate-blink' : ''} />

      {/* Cabeza */}
      <rect x="14" y="16" width="52" height="36" rx="10" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5"/>

      {/* Scanline en la cabeza */}
      <rect x="14" y="16" width="52" height="36" rx="10" fill="url(#scanGrad)" opacity="0.3"/>

      {/* Ojos */}
      <rect x="22" y="26" width="14" height="10" rx="3" fill="var(--accent)" opacity="0.9"/>
      <rect x="44" y="26" width="14" height="10" rx="3" fill="var(--accent)" opacity="0.9"/>

      {/* Pupila izquierda */}
      <rect x="26" y="28" width="6" height="6" rx="1.5" fill="var(--bg-card)"/>
      {/* Pupila derecha */}
      <rect x="48" y="28" width="6" height="6" rx="1.5" fill="var(--bg-card)"/>

      {/* Boca */}
      <rect x="24" y="42" width="32" height="4" rx="2" fill="var(--accent)" opacity="0.5"/>
      <rect x="28" y="42" width="6" height="4" rx="1" fill="var(--accent)"/>
      <rect x="38" y="42" width="6" height="4" rx="1" fill="var(--accent)"/>
      <rect x="48" y="42" width="6" height="4" rx="1" fill="var(--accent)"/>

      {/* Cuerpo */}
      <rect x="22" y="54" width="36" height="20" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5"/>

      {/* Botones del cuerpo */}
      <circle cx="32" cy="62" r="3" fill="var(--accent)" opacity="0.7"/>
      <circle cx="40" cy="62" r="3" fill="var(--accent)" opacity="0.4"/>
      <circle cx="48" cy="62" r="3" fill="var(--accent)" opacity="0.7"/>

      {/* Brazos */}
      <rect x="6" y="54" width="14" height="8" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5"/>
      <rect x="60" y="54" width="14" height="8" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5"/>

      <defs>
        <linearGradient id="scanGrad" x1="14" y1="16" x2="14" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

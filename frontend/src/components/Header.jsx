import { useStore } from '../store/useStore'
import RobertitoAvatar from './RobertitoAvatar'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-5.15"/>
    </svg>
  )
}

export default function Header() {
  const { isDark, toggleTheme, documents, resetSession, isUploading, isThinking } = useStore()

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-8 border-b border-theme bg-secondary">
      <div className="flex items-center gap-4">
        <RobertitoAvatar size={40} />
        <div>
          <div className="font-display text-bg font-bold text-primary tracking-tight leading-none mt-2">
            Pregun<span className="text-accent">Tito</span>
          </div>
          <div className="font-display text-xs text-muted tracking-widest leading-none mt-1">
            con Robertito
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={!isUploading && !isThinking ? resetSession : undefined}
          disabled={isUploading || isThinking}
          title={isUploading ? 'Esperá que termine de cargar' : isThinking ? 'Esperá la respuesta' : 'Nueva sesión'}
          className={`w-9 h-9 rounded-lg flex items-center justify-center border border-theme transition-all
            ${isUploading || isThinking
              ? 'text-muted cursor-not-allowed opacity-40'
              : 'text-muted hover:text-accent hover:bg-card'
            }`}
        >
          <RefreshIcon />
        </button>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-accent hover:bg-card border border-theme transition-all"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
import { useState } from 'react'
import RobertitoAvatar from './RobertitoAvatar'

function UserBubble({ content }) {
  return (
    <div className="flex justify-end animate-slideUp">
      <div className="max-w-[75%] bg-card border border-theme rounded-2xl rounded-tr-sm px-4 py-3 text-sm font-body leading-relaxed shadow-md text-primary">
        {content}
      </div>
    </div>
  )
}

function BotBubble({ content, sources }) {
  const [showSources, setShowSources] = useState(false)

  return (
    <div className="flex gap-3 animate-slideUp">
      <div className="shrink-0 mt-1">
        <RobertitoAvatar size={32} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="w-3/4 bg-card border border-theme rounded-2xl rounded-tl-sm px-4 py-3 text-sm font-body leading-relaxed text-primary terminal-border">
          {content}
        </div>

        {sources && sources.length > 0 && (
          <div>
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-muted hover:text-accent font-display tracking-wider uppercase px-1 flex items-center gap-1 transition-colors"
            >
              <span>{showSources ? '▾' : '▸'}</span>
              {showSources ? 'Ocultar fuentes' : `Ver fuentes (${sources.length})`}
            </button>

            {showSources && (
            <div className="mt-2 space-y-2">
              {sources.map((s, i) => (
                <details key={i} className="text-xs bg-secondary border border-theme rounded-lg overflow-hidden">
                  <summary className="px-3 py-2 cursor-pointer text-accent font-display tracking-wider hover:bg-card transition-colors">
                    [{i + 1}] Ver fragmento
                  </summary>
                  <div className="px-3 py-2 text-secondary font-body leading-relaxed border-t border-theme">
                    {s.content}
                  </div>
                </details>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      <div className="shrink-0 mt-1">
        <RobertitoAvatar size={32} animate />
      </div>
      <div className="bg-card border border-theme rounded-2xl rounded-tl-sm px-4 py-3 scanline inline-flex">
        <span className="text-xs text-muted font-display animate-dots">pensando</span>
      </div>
    </div>
  )
}

function WelcomeBubble({ active }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-1">
        <RobertitoAvatar size={32} animate={active} />
      </div>
      <div className="bg-card border border-theme rounded-2xl rounded-tl-sm px-4 py-3 text-sm font-body leading-relaxed text-primary terminal-border">
        ¡Hola! Soy <span className="text-accent font-display">Robertito</span> <br />
        Subí uno o varios PDFs en el panel izquierdo y haceme las preguntas que quieras. Solo respondo basándome en tus documentos.
      </div>
    </div>
  )
}

export { UserBubble, BotBubble, ThinkingBubble, WelcomeBubble }

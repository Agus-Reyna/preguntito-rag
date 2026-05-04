import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { askQuestion } from '../services/api'
import { UserBubble, BotBubble, ThinkingBubble, WelcomeBubble } from './ChatBubbles'

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

export default function ChatArea() {
  const { messages, isThinking, addMessage, setThinking, sessionId, documents, isUploading } = useStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSend = async () => {
    const query = input.trim()
    if (!query || isThinking || isUploading) return
    if (documents.length === 0) {
      addMessage({ role: 'bot', content: 'Primero tenés que subir al menos un PDF 📄', sources: [] })
      return
    }

    setInput('')
    addMessage({ role: 'user', content: query })
    setThinking(true)

    try {
      const result = await askQuestion(query, sessionId)
      addMessage({ role: 'bot', content: result.answer, sources: result.sources })
    } catch (e) {
      addMessage({
        role: 'bot',
        content: 'Ups, algo salió mal. Verificá que el backend esté corriendo y los documentos estén procesados.',
        sources: [],
      })
    } finally {
      setThinking(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isUploading) handleSend() 
    }
  }

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  useEffect(() => {
    if (isUploading) {
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [isUploading])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <WelcomeBubble active={messages.length === 0} />
        {messages.map((msg) =>
          msg.role === 'user'
            ? <UserBubble key={msg.id} content={msg.content} />
            : <BotBubble key={msg.id} content={msg.content} sources={msg.sources} />
        )}
        {isThinking && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-theme bg-secondary">
        <div className="flex gap-3 items-center bg-card border border-theme rounded-2xl px-4 py-3 focus-within:border-accent transition-colors terminal-border">
          <textarea
            disabled={isUploading}
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e) }}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? 'Esperá que termine de cargar el documento...' : 'Preguntale algo a Robertito...'}
            rows={1}
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted resize-none outline-none font-body leading-relaxed"
            style={{ minHeight: '24px', maxHeight: '160px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking || isUploading}
            className={`
              shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
              ${input.trim() && !isThinking
                ? 'bg-accent text-dark-950 hover:scale-110 glow-accent'
                : 'bg-secondary text-muted cursor-not-allowed'
              }
            `}
          >
            <SendIcon />
          </button>
        </div>
        <div className="mt-2 text-center text-xs text-muted font-display">
          Enter para enviar · Shift+Enter para nueva línea
        </div>
      </div>
    </div>
  )
}

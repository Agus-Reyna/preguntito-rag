import { useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { uploadDocument } from '../services/api'

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

export default function Sidebar() {
  const { sessionId, documents, addDocument, removeDocument, setUploading, isUploading } = useStore()
  const fileRef = useRef()
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

const handleUpload = async (file) => {
  if (!file || !file.name.endsWith('.pdf')) return

  const activeSession = sessionId.trim() || 'mi-sesion'
  useStore.setState({ sessionId: activeSession })

  setUploading(true)
  setProgress(0)
  try {
    const doc = await uploadDocument(file, activeSession, setProgress)
    addDocument({ ...doc, name: file.name })
  } catch (e) {
    console.error('Error subiendo PDF:', e)
  } finally {
    setUploading(false)
    setProgress(0)
    if (fileRef.current) fileRef.current.value = '';
  }
}

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files[0])
  }

  if (collapsed) {
    return (
      <aside className="shrink-0 w-14 flex flex-col items-center py-4 gap-3 border-r border-theme bg-secondary transition-all duration-300">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-card border border-theme transition-all"
          title="Expandir panel"
        >
          <ChevronRight />
        </button>
        {documents.length > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent animate-blink" />
            <span className="text-accent font-display text-xs">{documents.length}</span>
            <span className="text-accent font-display text-xs">PDF{documents.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </aside>
    )
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-theme bg-secondary transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-theme">
        <div className="flex items-center justify-between mb-1">
          <span className="font-display text-xs text-accent tracking-widest uppercase">Sesión</span>
          <button
            onClick={() => setCollapsed(true)}
            title="Minimizar panel"
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-card border border-theme transition-all"
          >
            <ChevronLeft />
          </button>
        </div>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => useStore.setState({ sessionId: e.target.value })}
          onBlur={(e) => {
            if (!e.target.value.trim()) {
              useStore.setState({ sessionId: 'mi-sesion' })
            }
          }}
          placeholder="ej: tesis, parcial..."
          className="text-xs text-secondary font-display bg-card px-2 py-1 rounded block w-full border border-theme outline-none focus:border-accent transition-colors placeholder:text-muted"
        />
      </div>

      {/* Upload zone */}
      <div className="p-4 border-b border-theme">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileRef.current?.click()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200
            ${dragOver ? 'border-accent bg-card scale-[1.02]' : 'border-theme hover:border-accent hover:bg-card'}
          `}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="text-xs text-secondary font-display">
                {progress < 100 ? 'Subiendo...' : 'Procesando...'}
              </div>
              <div className="h-1 bg-card rounded-full overflow-hidden border border-theme relative">
                {progress < 100
                  ? <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  : <div className="animate-indeterminate" />
                }
              </div>
              <div className="text-xs text-accent font-display">
                {progress < 100 ? `${progress}%` : 'Generando embeddings...'}
              </div>
            </div>
          ) : (
            <>
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs text-secondary">
                <span className="text-accent font-display">Subir PDF</span>
                <br />
                <span className="text-muted">o arrastrar acá</span>
              </div>
            </>
          )}
        </div>
        <input 
          ref={fileRef} 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          onChange={(e) => {
            handleUpload(e.target.files[0]);
            e.target.value = '';
          }} 
        />
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted text-xs font-display leading-relaxed">
              Sin documentos.<br />Subí un PDF para empezar.
            </div>
          </div>
        ) : (
          <>
            <div className="text-xs text-muted font-display uppercase tracking-widest mb-3">
              {documents.length} documento{documents.length !== 1 ? 's' : ''}
            </div>
            {documents.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-2 p-2 rounded-lg bg-card border border-theme hover:border-accent transition-all animate-fadeIn">
                <span className="text-accent shrink-0"><FileIcon /></span>
                <span className="text-xs text-secondary truncate flex-1 font-body">{doc.name}</span>
                <button onClick={() => removeDocument(doc.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all shrink-0">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
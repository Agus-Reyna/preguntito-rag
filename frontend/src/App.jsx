import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'

export default function App() {
  const { isDark, isUploading } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isUploading])

  return (
    <div className="h-screen flex flex-col bg-primary overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  )
}

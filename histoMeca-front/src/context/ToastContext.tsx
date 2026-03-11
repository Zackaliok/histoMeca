import { createContext, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const ALERT_CLASS: Record<ToastType, string> = {
  success: 'alert-success',
  error:   'alert-error',
  warning: 'alert-warning',
  info:    'alert-info',
}

const DURATION_MS = 4000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, DURATION_MS)
  }, [])

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {toasts.length > 0 && (
        <div className="toast toast-end toast-top z-50">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="alert"
              className={`alert ${ALERT_CLASS[t.type]} cursor-pointer shadow-lg`}
              onClick={() => dismiss(t.id)}
            >
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

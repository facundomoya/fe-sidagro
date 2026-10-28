import { useEffect, useId, useRef, type ReactNode } from 'react'
import { IconClose } from './icons/Icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Impide cerrar el modal (X y Escape), por ejemplo mientras se guarda. */
  bloqueado?: boolean
}

// Usa <dialog> nativo: aporta el cierre con Escape, el foco dentro del modal y el fondo oscurecido.
function Modal({ open, title, onClose, children, bloqueado = false }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={tituloId}
      aria-busy={bloqueado}
      onKeyDown={(e) => {
        // Cancelar la tecla evita que el navegador cierre el diálogo aunque se repita Escape.
        if (bloqueado && e.key === 'Escape') e.preventDefault()
      }}
      onCancel={(e) => {
        e.preventDefault()
        if (!bloqueado) onClose()
      }}
    >
      {open && (
        <>
          <header className="modal__header">
            <h2 id={tituloId}>{title}</h2>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              disabled={bloqueado}
              aria-label="Cerrar"
            >
              <IconClose />
            </button>
          </header>
          <div className="modal__body">{children}</div>
        </>
      )}
    </dialog>
  )
}

export default Modal

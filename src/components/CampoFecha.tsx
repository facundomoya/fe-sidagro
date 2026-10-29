import { useRef, useState, type ChangeEvent } from 'react'
import { IconCalendar } from './icons/Icons'
import { enmascararFecha, esFechaIsoValida, isoATextoArgentino, textoArgentinoAIso } from '../utils/fechas'

interface CampoFechaProps {
  /**
   * YYYY-MM-DD cuando la fecha está completa y es válida, '' si está vacía, o el texto tal
   * como se escribió (por ejemplo "29/10") si está incompleta o no existe. Así las
   * validaciones de cada formulario pueden distinguir "falta" de "no es válida".
   */
  value: string
  onChange: (valor: string) => void
  onBlur?: () => void
  /** Límites del calendario (YYYY-MM-DD). Los formularios los vuelven a validar. */
  min?: string
  max?: string
  disabled?: boolean
  invalid?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
}

/** Texto escrito a valor del formulario: ISO si es una fecha real, si no el mismo texto. */
function aValor(texto: string): string {
  const limpio = texto.trim()
  return limpio === '' ? '' : (textoArgentinoAIso(limpio) ?? limpio)
}

/**
 * Campo de fecha en formato argentino (DD/MM/YYYY). El input nativo type="date" muestra el
 * formato del idioma del navegador o del sistema (por ejemplo MM/DD/YYYY), así que la fecha
 * se escribe en un campo de texto y el calendario nativo se abre con el botón.
 */
function CampoFecha({
  value,
  onChange,
  onBlur,
  min,
  max,
  disabled,
  invalid,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: CampoFechaProps) {
  const [texto, setTexto] = useState(() => isoATextoArgentino(value))
  const [valorPrevio, setValorPrevio] = useState(value)
  const calendarioRef = useRef<HTMLInputElement>(null)

  // Si el valor cambia desde afuera (calendario, reinicio del formulario), se actualiza el texto.
  if (value !== valorPrevio) {
    setValorPrevio(value)
    if (aValor(texto) !== value) setTexto(isoATextoArgentino(value))
  }

  function handleTexto(e: ChangeEvent<HTMLInputElement>) {
    const nuevo = enmascararFecha(e.target.value)
    setTexto(nuevo)
    onChange(aValor(nuevo))
  }

  function abrirCalendario() {
    const calendario = calendarioRef.current
    if (!calendario || disabled) return
    try {
      calendario.showPicker()
    } catch {
      // Navegadores sin showPicker: el campo de texto sigue disponible.
      calendario.focus()
    }
  }

  return (
    <div className={`campo-fecha${disabled ? ' campo-fecha--deshabilitado' : ''}`}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={texto}
        onChange={handleTexto}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      <button
        type="button"
        className="campo-fecha__calendario"
        onClick={abrirCalendario}
        disabled={disabled}
        aria-label="Elegir la fecha en el calendario"
        title="Elegir en el calendario"
      >
        <IconCalendar />
      </button>
      {/* Solo aporta el calendario; el valor visible es el del campo de texto. */}
      <input
        ref={calendarioRef}
        type="date"
        className="campo-fecha__nativo"
        tabIndex={-1}
        aria-hidden="true"
        value={esFechaIsoValida(value) ? value : ''}
        min={min && esFechaIsoValida(min) ? min : undefined}
        max={max && esFechaIsoValida(max) ? max : undefined}
        onChange={(e) => {
          if (!esFechaIsoValida(e.target.value)) return
          setTexto(isoATextoArgentino(e.target.value))
          onChange(e.target.value)
          onBlur?.()
        }}
        disabled={disabled}
      />
    </div>
  )
}

export default CampoFecha

import { useState, type FormEvent } from 'react'
import StatusMessage from '../StatusMessage'
import CampoFecha from '../CampoFecha'
import { crearLote } from '../../services/catalogoService'
import type { CampaniaApi, LoteApi, NuevoLoteApi, ProvinciaApi } from '../../types/catalogo'
import { mensajeErrorGuardado } from './errores'
import { MAX_NOMBRE, MAX_UBICACION, errorFechaObligatoria, leerSuperficie } from './validacion'
import { useGuardado } from './useGuardado'

interface LoteFormProps {
  campanias: CampaniaApi[]
  provincias: ProvinciaApi[]
  /** Campaña preseleccionada (por ejemplo, la del filtro del listado). */
  campaniaInicial: number | null
  onCancel: () => void
  onSaved: (lote: LoteApi) => void
  onGuardandoChange: (guardando: boolean) => void
}

interface Valores {
  nombre: string
  campaniaId: string
  provinciaId: string
  ubicacion: string
  superficie: string
  fechaSiembra: string
}

type Errores = Partial<Record<keyof Valores, string>>

function validar(valores: Valores): Errores {
  const errores: Errores = {}
  const nombre = valores.nombre.trim()
  if (!nombre) errores.nombre = 'Ingresá el nombre del lote.'
  else if (nombre.length > MAX_NOMBRE) errores.nombre = `El nombre admite hasta ${MAX_NOMBRE} caracteres.`

  if (!valores.campaniaId) errores.campaniaId = 'Seleccioná la campaña.'
  if (!valores.provinciaId) errores.provinciaId = 'Seleccioná la provincia.'

  if (valores.ubicacion.trim().length > MAX_UBICACION) {
    errores.ubicacion = `La ubicación admite hasta ${MAX_UBICACION} caracteres.`
  }

  const superficie = leerSuperficie(valores.superficie)
  if ('error' in superficie) errores.superficie = superficie.error

  // El backend la admite opcional, pero el frontend la exige para que el lote pueda monitorearse.
  const errorSiembra = errorFechaObligatoria(valores.fechaSiembra, 'fecha de siembra')
  if (errorSiembra) errores.fechaSiembra = errorSiembra

  return errores
}

function LoteForm({
  campanias,
  provincias,
  campaniaInicial,
  onCancel,
  onSaved,
  onGuardandoChange,
}: LoteFormProps) {
  const [valores, setValores] = useState<Valores>({
    nombre: '',
    campaniaId: campaniaInicial ? String(campaniaInicial) : '',
    // Con una sola provincia disponible no hay nada que elegir.
    provinciaId: provincias.length === 1 ? String(provincias[0].id) : '',
    ubicacion: '',
    superficie: '',
    fechaSiembra: '',
  })
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const { guardando, errorGuardado, guardar } = useGuardado(onGuardandoChange)

  const errores = intentoEnvio ? validar(valores) : {}

  function actualizar(campo: keyof Valores, valor: string) {
    setValores((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIntentoEnvio(true)
    if (Object.keys(validar(valores)).length > 0) return

    const ubicacion = valores.ubicacion.trim()
    const superficie = leerSuperficie(valores.superficie)
    const lote: NuevoLoteApi = {
      nombre: valores.nombre.trim(),
      campaniaId: Number(valores.campaniaId),
      provinciaId: Number(valores.provinciaId),
      fechaSiembra: valores.fechaSiembra,
      // Los opcionales vacíos no se envían.
      ...(ubicacion && { ubicacion }),
      ...('valor' in superficie && superficie.valor !== null && { superficie: superficie.valor }),
    }
    guardar(
      () => crearLote(lote),
      onSaved,
      (error) =>
        mensajeErrorGuardado(error, {
          accion: 'crear lotes',
          noEncontrado:
            'La campaña o la provincia seleccionada ya no existe. Cerrá el formulario y recargá la página.',
        }),
    )
  }

  if (campanias.length === 0) {
    return (
      <div className="form">
        <StatusMessage
          type="empty"
          message="Todavía no hay campañas registradas. Creá una campaña en la pestaña Campañas antes de registrar un lote."
        />
        <div className="form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="form-field">
        <span className="form-field__label">Nombre *</span>
        <input
          type="text"
          value={valores.nombre}
          maxLength={MAX_NOMBRE}
          onChange={(e) => actualizar('nombre', e.target.value)}
          disabled={guardando}
          placeholder="Por ejemplo, Lote Norte 1"
          aria-invalid={!!errores.nombre}
        />
        {errores.nombre && <span className="form-field__error">{errores.nombre}</span>}
      </label>

      <div className="gestion-form__fila">
        <label className="form-field">
          <span className="form-field__label">Campaña *</span>
          <select
            value={valores.campaniaId}
            onChange={(e) => actualizar('campaniaId', e.target.value)}
            disabled={guardando}
            aria-invalid={!!errores.campaniaId}
          >
            <option value="">Seleccioná una campaña</option>
            {campanias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errores.campaniaId && <span className="form-field__error">{errores.campaniaId}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Provincia *</span>
          <select
            value={valores.provinciaId}
            onChange={(e) => actualizar('provinciaId', e.target.value)}
            disabled={guardando}
            aria-invalid={!!errores.provinciaId}
          >
            <option value="">Seleccioná una provincia</option>
            {provincias.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errores.provinciaId && <span className="form-field__error">{errores.provinciaId}</span>}
        </label>
      </div>

      <label className="form-field">
        <span className="form-field__label">Ubicación</span>
        <input
          type="text"
          value={valores.ubicacion}
          maxLength={MAX_UBICACION}
          onChange={(e) => actualizar('ubicacion', e.target.value)}
          disabled={guardando}
          placeholder="Referencia del lote (opcional)"
          aria-invalid={!!errores.ubicacion}
        />
        {errores.ubicacion && <span className="form-field__error">{errores.ubicacion}</span>}
      </label>

      <div className="gestion-form__fila">
        <label className="form-field">
          <span className="form-field__label">Superficie (ha)</span>
          <input
            type="text"
            inputMode="decimal"
            value={valores.superficie}
            onChange={(e) => actualizar('superficie', e.target.value)}
            disabled={guardando}
            placeholder="Opcional, por ejemplo 120,5"
            aria-invalid={!!errores.superficie}
          />
          {errores.superficie && <span className="form-field__error">{errores.superficie}</span>}
        </label>

        <label className="form-field">
          <span className="form-field__label">Fecha de siembra *</span>
          <CampoFecha
            value={valores.fechaSiembra}
            onChange={(valor) => actualizar('fechaSiembra', valor)}
            disabled={guardando}
            invalid={!!errores.fechaSiembra}
            aria-describedby="lote-siembra-ayuda"
          />
          {errores.fechaSiembra && <span className="form-field__error">{errores.fechaSiembra}</span>}
        </label>
      </div>

      <p id="lote-siembra-ayuda" className="gestion-aviso">
        El Monitoreo calcula los grados día desde la fecha de siembra. Revisala antes de guardar:
        una vez registrada no se puede modificar desde SID-Agro.
      </p>

      {errorGuardado && <StatusMessage type="error" message={errorGuardado} />}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando} aria-busy={guardando}>
          {guardando && <span className="btn__spinner gestion-form__spinner" aria-hidden="true" />}
          {guardando ? 'Guardando...' : 'Crear lote'}
        </button>
      </div>
    </form>
  )
}

export default LoteForm

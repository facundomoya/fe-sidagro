// Funcionalidades del módulo económico que el backend todavía no calcula. No muestran valores.
const PENDIENTES = [
  'Pérdidas económicas estimadas por plagas.',
  'Costos de aplicación de tratamientos.',
  'Comparación económica entre escenarios.',
]

function Proximamente() {
  return (
    <section className="pending-card economico-proximamente" aria-labelledby="economico-proximamente">
      <h2 id="economico-proximamente" className="economico-seccion__titulo">
        Próximamente
      </h2>
      <p className="economico-seccion__nota">
        Funcionalidades pendientes de definición del cálculo. Todavía no están disponibles.
      </p>
      <ul>
        {PENDIENTES.map((texto) => (
          <li key={texto}>{texto}</li>
        ))}
      </ul>
    </section>
  )
}

export default Proximamente

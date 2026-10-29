import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

// Debe coincidir con el breakpoint de Layout.css.
const CONSULTA_PANTALLA_CHICA = '(max-width: 900px)'

function usePantallaChica(): boolean {
  const [chica, setChica] = useState(() => window.matchMedia(CONSULTA_PANTALLA_CHICA).matches)
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_PANTALLA_CHICA)
    const actualizar = () => setChica(consulta.matches)
    consulta.addEventListener('change', actualizar)
    return () => consulta.removeEventListener('change', actualizar)
  }, [])
  return chica
}

function MainLayout() {
  const pantallaChica = usePantallaChica()
  // En pantallas chicas el menú se despliega sobre el contenido; en escritorio se oculta
  // por completo y el contenido ocupa el ancho liberado. Las animaciones están en Layout.css.
  const [abiertoEnMovil, setAbiertoEnMovil] = useState(false)
  const [ocultoEnEscritorio, setOcultoEnEscritorio] = useState(false)
  const [pantallaPrevia, setPantallaPrevia] = useState(pantallaChica)
  const [sinTransicion, setSinTransicion] = useState(false)
  // Al cambiar de tamaño de pantalla, el menú desplegable de móvil arranca cerrado y el
  // cambio de modo se aplica sin animación.
  if (pantallaPrevia !== pantallaChica) {
    setPantallaPrevia(pantallaChica)
    setAbiertoEnMovil(false)
    setSinTransicion(true)
  }
  const menuVisible = pantallaChica ? abiertoEnMovil : !ocultoEnEscritorio
  const menuMovilAbierto = pantallaChica && abiertoEnMovil

  // Las transiciones vuelven después de que el navegador pintó el nuevo modo.
  useEffect(() => {
    if (!sinTransicion) return
    let segundo = 0
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setSinTransicion(false))
    })
    return () => {
      cancelAnimationFrame(primero)
      cancelAnimationFrame(segundo)
    }
  }, [sinTransicion])

  useEffect(() => {
    if (!menuMovilAbierto) return
    document.body.classList.add('menu-movil-abierto')
    return () => document.body.classList.remove('menu-movil-abierto')
  }, [menuMovilAbierto])

  function alternarMenu() {
    if (pantallaChica) setAbiertoEnMovil((abierto) => !abierto)
    else setOcultoEnEscritorio((oculto) => !oculto)
  }

  const clases = ['layout']
  if (ocultoEnEscritorio) clases.push('layout--sin-menu')
  if (sinTransicion) clases.push('layout--sin-transicion')

  return (
    <div className={clases.join(' ')}>
      <Sidebar
        open={abiertoEnMovil}
        oculto={!menuVisible}
        onClose={() => setAbiertoEnMovil(false)}
      />
      <div
        className={`layout__overlay${menuMovilAbierto ? ' layout__overlay--visible' : ''}`}
        onClick={() => setAbiertoEnMovil(false)}
        aria-hidden="true"
      />
      <div className="layout__main">
        <Header menuVisible={menuVisible} onMenuClick={alternarMenu} />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout

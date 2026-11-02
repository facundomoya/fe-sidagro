// Validaciones de usuarios con los mismos límites que CreateUserDto del backend.

/** Mínimos del backend (MinLength) y largo de las columnas varchar. */
export const MIN_USUARIO = 4
export const MIN_CONTRASENIA = 6
export const MAX_TEXTO = 255

export interface DatosUsuario {
  username: string
  email: string
  name: string
  lastname: string
}

export type ErroresDatos = Partial<Record<keyof DatosUsuario, string>>

// Comprobación básica; el backend valida el formato completo (IsEmail).
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarDatos(valores: DatosUsuario): ErroresDatos {
  const errores: ErroresDatos = {}
  const username = valores.username.trim()
  if (!username) errores.username = 'Ingresá el nombre de usuario.'
  else if (username.length < MIN_USUARIO) {
    errores.username = `El nombre de usuario debe tener al menos ${MIN_USUARIO} caracteres.`
  } else if (/\s/.test(username)) errores.username = 'El nombre de usuario no puede tener espacios.'

  const email = valores.email.trim()
  if (!email) errores.email = 'Ingresá el correo electrónico.'
  else if (!CORREO.test(email)) errores.email = 'Ingresá un correo electrónico válido.'

  if (!valores.name.trim()) errores.name = 'Ingresá el nombre.'
  if (!valores.lastname.trim()) errores.lastname = 'Ingresá el apellido.'

  for (const campo of ['username', 'email', 'name', 'lastname'] as const) {
    if (!errores[campo] && valores[campo].trim().length > MAX_TEXTO) {
      errores[campo] = `Admite hasta ${MAX_TEXTO} caracteres.`
    }
  }
  return errores
}

export interface ErroresContrasenia {
  password?: string
  repetir?: string
}

export function validarContrasenia(password: string, repetir: string): ErroresContrasenia {
  const errores: ErroresContrasenia = {}
  if (!password) errores.password = 'Ingresá la contraseña.'
  else if (password.length < MIN_CONTRASENIA) {
    errores.password = `La contraseña debe tener al menos ${MIN_CONTRASENIA} caracteres.`
  } else if (password.length > MAX_TEXTO) errores.password = `Admite hasta ${MAX_TEXTO} caracteres.`
  if (!errores.password && repetir !== password) errores.repetir = 'Las contraseñas no coinciden.'
  return errores
}

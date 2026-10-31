// Estado compartido mínimo entre AuthScreen y App durante la recuperación de contraseña.
//
// Para cambiar la contraseña con un código de correo, Supabase primero inicia sesión (verifyOtp) y
// recién después se puede llamar a updateUser. Sin este flag, App vería la sesión nueva y sacaría a la
// persona de la pantalla antes de que termine de escribir su nueva contraseña.

let recovering = false
const listeners = new Set<() => void>()

export const authFlow = {
  isRecovering: () => recovering,
  setRecovering(value: boolean) {
    recovering = value
    listeners.forEach((l) => l())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

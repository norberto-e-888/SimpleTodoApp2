const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWZYX'
const minisculas = 'abcdefghijklmnopqrstuvwzyx'
const numeros = '0123456789'
const especiales = '!#$*'

export default (
	longitud: number,
	{ chars = '!#Aa', posibilidadesIguales = false }
) => {
	if (longitud <= 0) {
		throw Error('longitud debe ser mayor a cero')
	}

	let codigo = ''
	let opciones = ''
	const allowedChars = Array.from(new Set(chars.split('')))
	if (!posibilidadesIguales) {
		for (const char of allowedChars) {
			switch (char) {
				case 'A':
					opciones += mayusculas
					break

				case 'a':
					opciones += minisculas
					break

				case '#':
					opciones += numeros
					break

				case '!':
					opciones += especiales
					break

				default:
					break
			}
		}

		if (!opciones.length) {
			throw new Error(
				'"chars" debe incluir algún caracter representante de grupo (A, a, #, !)'
			)
		}

		for (let i = 0; i < longitud; i++) {
			const randomIndex = Math.floor(Math.random() * opciones.length)
			codigo += opciones[randomIndex]
		}
	} else {
		for (let i = 0; i < longitud; i++) {
			const randomIndex = Math.floor(Math.random() * allowedChars.length)
			let opcionesDeEstaIteracion = ''
			switch (allowedChars[randomIndex]) {
				case 'A':
					opcionesDeEstaIteracion = mayusculas
					break

				case 'a':
					opcionesDeEstaIteracion = minisculas
					break

				case '!':
					opcionesDeEstaIteracion = especiales
					break

				case '#':
					opcionesDeEstaIteracion = numeros
					break

				default:
					break
			}

			const randomSetIndex = Math.floor(
				Math.random() * opcionesDeEstaIteracion.length
			)

			codigo += opcionesDeEstaIteracion[randomSetIndex]
		}
	}

	return codigo
}

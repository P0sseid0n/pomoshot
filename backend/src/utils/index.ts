export const fileToBase64 = async (file: File) => (await file.bytes()).toBase64()

// sem 0/o, 1/l: o ID aparece no link e pode ser digitado. 32 letras dividem 256, então não há viés no módulo.
const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

export const generateId = (length: number) =>
	Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => ID_ALPHABET[byte % ID_ALPHABET.length]).join('')

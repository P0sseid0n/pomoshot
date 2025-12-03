export const fileToBase64 = async (file: File) => (await file.bytes()).toBase64()

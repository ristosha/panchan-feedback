export function safeString(str: string) {
  return str.replaceAll('_', '\\_')
}

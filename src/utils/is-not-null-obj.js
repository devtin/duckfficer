export function isNotNullObj (obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null
}

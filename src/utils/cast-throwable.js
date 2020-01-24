export function castThrowable (value, error) {
  if (Array.isArray(value) && value.length === 2) {
    return value
  }

  return [value, error]
}

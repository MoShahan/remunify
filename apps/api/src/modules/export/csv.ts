export function escapeCsvValue(value: string | number | null | undefined) {
  const raw = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replaceAll('"', '""')}"`
  }
  return raw
}

export function toCsvRow(values: Array<string | number | null | undefined>) {
  return `${values.map(escapeCsvValue).join(',')}\n`
}

export function formatLocalDate(
  timestamp: number,
  includeTime = false,
  region: Pick<Intl.ResolvedDateTimeFormatOptions, 'locale' | 'timeZone'> = Intl.DateTimeFormat().resolvedOptions(),
): string {
  const locale = region.timeZone === 'Europe/Vienna' ? 'de-AT' : region.locale
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: region.timeZone,
  }).format(timestamp)
  if (!includeTime) return date
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: region.timeZone,
  }).format(timestamp)
  return `${date} · ${time}`
}

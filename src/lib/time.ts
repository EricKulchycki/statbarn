import { cookies } from 'next/headers'

export async function getTimezoneFromCookie() {
  const requestHeaders = await cookies()
  let localTimezone = requestHeaders.get('localTimezone')?.value

  if (!localTimezone) {
    localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return localTimezone
}

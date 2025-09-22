import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Read the localDate cookie from the request
  const localDate = request.cookies.get('localDate')?.value

  // Clone the response and set a header with the localDate value
  const response = NextResponse.next()
  if (localDate) {
    response.headers.set('x-local-date', localDate)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}

import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLogin = req.nextUrl.pathname.startsWith('/login');
  const isOnApi = req.nextUrl.pathname.startsWith('/api');

  // Allow API routes
  if (isOnApi) {
    return;
  }

  // Redirect to dashboard if logged in and on login page
  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl));
  }

  // Redirect to login if not logged in and not on login page
  if (!isOnLogin && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

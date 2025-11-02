import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔒 Auth Interceptor: Request to', req.url);

  // Try sessionStorage first (current session)
  let token = sessionStorage.getItem('auth_token');
  console.log('🔒 Token from sessionStorage:', token ? token.substring(0, 20) + '...' : 'null');

  // If not in session, try cookies (for page reload)
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
      console.log('🔒 Token from cookie:', token ? token.substring(0, 20) + '...' : 'null');
    }
  }

  if (token) {
    console.log('🔒 Adding Authorization header to request');
    // Clone the request and add the authorization header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq);
  }

  console.log('🔒 No token found, sending request without auth');
  return next(req);
};

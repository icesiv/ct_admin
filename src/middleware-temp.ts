import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from "jwt-decode";

const protectedRoutes: Record<string, Array<'admin' | 'editor' | 'basic'>> = {
  '/posts/create': ['admin', 'editor'],
  '/lead-news': ['admin', 'editor'],
  '/breaking-news': ['admin'],
  '/photo-gallery': ['admin'],
  '/video': ['admin'], 
  '/topics': ['admin'],
  '/users': ['admin'], 
  '/menu': ['admin'],
  '/categories': ['admin'],
  
};

function getUserRoleFromToken(request: NextRequest): 'admin' | 'editor' | 'basic' | null {
  try {
    const token = request.cookies.get('auth_token')?.value; 
    console.log("Token from request:", token);

    if (!token) return null;

    const decodedToken: any = jwtDecode(token);
    const role = decodedToken?.user_role;

    if (role && ['admin', 'editor', 'basic'].includes(role)) {
       return role as 'admin' | 'editor' | 'basic';
    }
    return null;
  } catch (error) {
    console.error("Error getting user role from token:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredRoles) {
  
    const userRole = getUserRoleFromToken(request);
  
    if (!userRole) {
    
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!requiredRoles.includes(userRole)) {
      const forbiddenUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

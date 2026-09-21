import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  console.log('[admin-secret] Request received');

  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    console.log('[admin-secret] No token');
    return new NextResponse(JSON.stringify({ secret: null }), { status: 401 });
  }

  const baseUrl = process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.log('[admin-secret] No API base URL');
    return new NextResponse(JSON.stringify({ secret: null }), { status: 500 });
  }

  console.log(`[admin-secret] Fetching user from ${baseUrl}/api/v1/me`);
  const res = await fetch(`${baseUrl}/api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.log(`[admin-secret] User fetch failed: ${res.status}`);
    return new NextResponse(JSON.stringify({ secret: null }), { status: 401 });
  }

  const user = await res.json();
  console.log(`[admin-secret] User role: ${user.role}`);

  if (user.role !== 'admin' && user.role !== 'root') {
    console.log('[admin-secret] User not admin');
    return new NextResponse(JSON.stringify({ secret: null }), { status: 403 });
  }

  const secret = process.env.ADMIN_SECRET_URI;
  console.log(`[admin-secret] Returning secret: ${secret ? 'present' : 'missing'}`);
  return NextResponse.json({ secret });
}

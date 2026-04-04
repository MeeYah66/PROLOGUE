import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';
  const safeNext = next.startsWith('/') ? next : '/';
  const isEmailVerification =
    type === 'signup' || type === 'email' || type === 'invite';
  const successRedirectPath = isEmailVerification ? '/signin?verified=1' : safeNext;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${successRedirectPath}`);
    }
    return NextResponse.redirect(`${origin}/signin?error=verification_failed`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${successRedirectPath}`);
    }

    return NextResponse.redirect(`${origin}/signin?error=verification_failed`);
  }

  return NextResponse.redirect(`${origin}/signin?error=invalid_callback`);
}

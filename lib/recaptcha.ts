const RECAPTCHA_V2_SECRET_KEY = process.env.RECAPTCHA_V2_SECRET_KEY;

/**
 * Verify reCAPTCHA v2 Checkbox token ("I'm not a robot" / image challenge).
 * Use for all forms. Requires RECAPTCHA_V2_SECRET_KEY and a
 * v2 Checkbox key from https://www.google.com/recaptcha/admin
 */
export async function verifyRecaptchaV2Token(token: string | undefined | null): Promise<boolean> {
  // If no secret key is provided, we can't verify, so we warn and allow in dev/test,
  // but this should be configured in production.
  if (!RECAPTCHA_V2_SECRET_KEY) {
    console.warn('RECAPTCHA_V2_SECRET_KEY is not set. Skipping reCAPTCHA v2 verification.');
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_V2_SECRET_KEY);
    params.append('response', token);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data: any = await res.json();
    if (!data.success) {
      console.warn('reCAPTCHA v2 verification failed:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA v2 token:', error);
    return false;
  }
}

// Deprecated: v3 verification removed as per user request
export async function verifyRecaptchaToken(token: string | undefined | null) {
  return verifyRecaptchaV2Token(token);
}

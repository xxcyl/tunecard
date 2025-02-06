interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookies = {
  async set(name: string, value: string, options: CookieOptions = {}) {
    await fetch('/api/cookies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, value, options }),
    })
  },

  async remove(name: string, options: CookieOptions = {}) {
    await fetch('/api/cookies', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, options }),
    })
  },
}

/**
 * Vercel Routing Middleware — bloqueio de acesso por HTTP Basic Auth.
 *
 * Roda no servidor do Vercel ANTES de qualquer arquivo ser entregue (inclusive o
 * index.html e os scripts), então o app inteiro fica inacessível sem usuário e senha.
 *
 * Configure no painel do Vercel (Project → Settings → Environment Variables):
 *   BASIC_AUTH_USER      = seu usuário
 *   BASIC_AUTH_PASSWORD  = uma senha forte (16+ caracteres)
 * Depois faça um novo deploy para as variáveis valerem.
 *
 * Sem as variáveis, o acesso é negado a todos (falha fechada).
 */
import { next } from '@vercel/functions';

declare const process: { env: Record<string, string | undefined> };

const REALM = 'Dashboard do Concurseiro';

/** Comparação em tempo constante para não vazar informação pelo tempo de resposta. */
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function unauthorized(message: string, status = 401) {
  return new Response(message, {
    status,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default function middleware(request: Request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !pass) {
    return unauthorized('Acesso bloqueado: defina BASIC_AUTH_USER e BASIC_AUTH_PASSWORD nas variáveis de ambiente do projeto no Vercel.', 503);
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');
  if (scheme?.toLowerCase() === 'basic' && encoded) {
    let decoded = '';
    try {
      decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
    } catch {
      return unauthorized('Credenciais inválidas.');
    }
    const sep = decoded.indexOf(':');
    const u = decoded.slice(0, sep);
    const p = decoded.slice(sep + 1);
    if (sep > -1 && safeEqual(u, user) && safeEqual(p, pass)) {
      return next();
    }
  }
  return unauthorized('Autenticação necessária.');
}

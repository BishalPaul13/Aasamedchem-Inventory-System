import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSql } from './db';

const COOKIE_NAME = 'aasa_session';
const PASSWORD_ITERATIONS = 120000;

function pbkdf2(password, salt, iterations) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString('hex'));
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(password, storedHash) {
  let salt;
  let hash;
  let iterations;

  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    iterations = Number(parts[1]);
    salt = parts[2];
    hash = parts[3];
  } else {
    [salt, hash] = storedHash.split(':');
    iterations = 310000;
  }

  if (!salt || !hash || !Number.isFinite(iterations)) return false;
  const candidate = await pbkdf2(password, salt, iterations);
  if (hash.length !== candidate.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

function getSecret() {
  return process.env.SESSION_SECRET || 'development-only-session-secret';
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return null;
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;
  return session;
}

export async function requireUser(role) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (role && user.role !== role) redirect('/dashboard');
  return user;
}

export async function login(email, password) {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE lower(email) = lower(${email})
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) return null;
  return user;
}

export async function setSession(user) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

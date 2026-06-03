import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSql } from './db';

const COOKIE_NAME = 'aasa_session';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const candidate = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
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
  if (!user || !verifyPassword(password, user.password_hash)) return null;
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

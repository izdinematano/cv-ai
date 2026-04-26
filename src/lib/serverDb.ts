/**
 * Simple file-based JSON "database" for the Next.js server.
 * Persists users, payments, and settings to a single JSON file so the
 * admin panel can see data from all clients (not just the current browser).
 *
 * Why: the original architecture kept everything in IndexedDB per-browser.
 * That works for a single-user PWA but breaks admin dashboards that need
 * a global view. This server-side store is a pragmatic stepping-stone
 * before moving to a real database (PostgreSQL, MongoDB, etc.).
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { AppUser, PaymentRequest, AdminSettings, ExportRecord, SavedCV } from '@/store/useAppStore';

const DB_PATH = process.env.CV_DB_PATH || join(process.cwd(), 'cv-data.json');

interface DbSnapshot {
  users: AppUser[];
  payments: PaymentRequest[];
  exports: ExportRecord[];
  extraCredits: Record<string, number>;
  adminSettings: AdminSettings;
  cvs: Record<string, SavedCV[]>;
  version: 1;
}

const DEFAULT_SNAPSHOT: DbSnapshot = {
  users: [],
  payments: [],
  exports: [],
  extraCredits: {},
  adminSettings: {
    mpesaNumber: '84 000 0000',
    whatsappNumber: '+258840000000',
    pricePerPackMZN: 100,
    creditsPerPack: 5,
    monthlyFreeExports: 5,
    businessName: 'CV Gen AI',
  },
  cvs: {},
  version: 1,
};

let memoryCache: DbSnapshot | null = null;

async function readDb(): Promise<DbSnapshot> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as DbSnapshot;
    memoryCache = parsed;
    return parsed;
  } catch {
    memoryCache = DEFAULT_SNAPSHOT;
    await writeDb(memoryCache);
    return memoryCache;
  }
}

async function writeDb(data: DbSnapshot): Promise<void> {
  memoryCache = data;
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export async function getAllUsers(): Promise<AppUser[]> {
  const db = await readDb();
  return db.users;
}

export async function findUserByEmail(email: string): Promise<AppUser | undefined> {
  const db = await readDb();
  return db.users.find((u) => u.email === email);
}

export async function createUser(user: AppUser): Promise<AppUser> {
  const db = await readDb();
  if (db.users.some((u) => u.email === user.email)) {
    throw new Error('Email ja registado');
  }
  // Auto-promote the very first user (bootstrap) and the owner email.
  if (db.users.length === 0 || user.email === 'izdinematano@gmail.com') {
    user.role = 'admin';
  }
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function updateUser(userId: string, patch: Partial<AppUser>): Promise<AppUser | null> {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...patch };
  await writeDb(db);
  return db.users[idx];
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  delete db.cvs[userId];
  delete db.extraCredits[userId];
  await writeDb(db);
  return true;
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export async function getAllPayments(): Promise<PaymentRequest[]> {
  const db = await readDb();
  return db.payments;
}

export async function createPayment(payment: PaymentRequest): Promise<PaymentRequest> {
  const db = await readDb();
  db.payments.unshift(payment);
  await writeDb(db);
  return payment;
}

export async function updatePayment(
  paymentId: string,
  patch: Partial<PaymentRequest>
): Promise<PaymentRequest | null> {
  const db = await readDb();
  const idx = db.payments.findIndex((p) => p.id === paymentId);
  if (idx === -1) return null;
  db.payments[idx] = { ...db.payments[idx], ...patch };
  await writeDb(db);
  return db.payments[idx];
}

/* ------------------------------------------------------------------ */
/* Extra credits                                                       */
/* ------------------------------------------------------------------ */

export async function getExtraCredits(userId: string): Promise<number> {
  const db = await readDb();
  return db.extraCredits[userId] || 0;
}

export async function addExtraCredits(userId: string, amount: number): Promise<number> {
  const db = await readDb();
  db.extraCredits[userId] = (db.extraCredits[userId] || 0) + amount;
  await writeDb(db);
  return db.extraCredits[userId];
}

/* ------------------------------------------------------------------ */
/* Admin settings                                                      */
/* ------------------------------------------------------------------ */

export async function getAdminSettings(): Promise<AdminSettings> {
  const db = await readDb();
  return db.adminSettings;
}

export async function updateAdminSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
  const db = await readDb();
  db.adminSettings = { ...db.adminSettings, ...patch };
  await writeDb(db);
  return db.adminSettings;
}

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export async function getAllExports(): Promise<ExportRecord[]> {
  const db = await readDb();
  return db.exports;
}

export async function createExport(record: ExportRecord): Promise<ExportRecord> {
  const db = await readDb();
  db.exports.push(record);
  await writeDb(db);
  return record;
}

/* ------------------------------------------------------------------ */
/* CVs                                                                 */
/* ------------------------------------------------------------------ */

export async function getUserCVs(userId: string): Promise<SavedCV[]> {
  const db = await readDb();
  return db.cvs[userId] || [];
}

export async function saveUserCV(userId: string, cv: SavedCV): Promise<SavedCV> {
  const db = await readDb();
  const list = db.cvs[userId] || [];
  const existing = list.find((c) => c.id === cv.id);
  if (existing) {
    const idx = list.findIndex((c) => c.id === cv.id);
    list[idx] = cv;
  } else {
    list.push(cv);
  }
  db.cvs[userId] = list;
  await writeDb(db);
  return cv;
}

export async function deleteUserCV(userId: string, cvId: string): Promise<void> {
  const db = await readDb();
  const list = db.cvs[userId] || [];
  db.cvs[userId] = list.filter((c) => c.id !== cvId);
  await writeDb(db);
}

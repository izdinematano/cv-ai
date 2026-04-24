'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CVData } from './useCVStore';

/* =============================================================================
 * Types
 * ===========================================================================*/

export type UserRole = 'user' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  password: string; // NOTE: plain text here because this is a localStorage mock
  role: UserRole;
  createdAt: string;
}

export interface SavedCV {
  id: string;
  name: string;
  data: CVData;
  updatedAt: string;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountMZN: number;
  credits: number;
  mpesaReference: string;
  whatsappNumber: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewerEmail?: string;
  rejectionReason?: string;
}

export interface ExportRecord {
  id: string;
  userId: string;
  cvId: string;
  cvName: string;
  createdAt: string;
  paid: boolean;
}

export interface AdminSettings {
  mpesaNumber: string;
  whatsappNumber: string;
  pricePerPackMZN: number;
  creditsPerPack: number;
  monthlyFreeExports: number;
  businessName: string;
}

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  mpesaNumber: '84 000 0000',
  whatsappNumber: '+258840000000',
  pricePerPackMZN: 100,
  creditsPerPack: 5,
  monthlyFreeExports: 5,
  businessName: 'CV Gen AI',
};

interface AppState {
  users: AppUser[];
  currentUserId: string | null;
  cvs: Record<string, SavedCV[]>; // userId -> list
  payments: PaymentRequest[];
  exports: ExportRecord[];
  /** extra (paid) credits per user on top of the monthly free quota */
  extraCredits: Record<string, number>;
  adminSettings: AdminSettings;

  /* auth */
  register: (input: { email: string; password: string; fullName: string }) =>
    | { ok: true; user: AppUser }
    | { ok: false; error: string };
  login: (input: { email: string; password: string }) =>
    | { ok: true; user: AppUser }
    | { ok: false; error: string };
  logout: () => void;

  /* cvs */
  getUserCVs: (userId: string) => SavedCV[];
  upsertCV: (
    userId: string,
    cv: { id?: string; name: string; data: CVData }
  ) => SavedCV;
  deleteCV: (userId: string, cvId: string) => void;

  /* quota + payments */
  getMonthlyExports: (userId: string) => number;
  remainingFreeExports: (userId: string) => number;
  totalAvailableExports: (userId: string) => number;
  canExport: (userId: string) => boolean;
  recordExport: (input: { userId: string; cvId: string; cvName: string }) => ExportRecord;
  requestPayment: (input: {
    userId: string;
    userEmail: string;
    mpesaReference: string;
    whatsappNumber: string;
    note: string;
  }) => PaymentRequest;
  approvePayment: (paymentId: string, adminEmail: string) => void;
  rejectPayment: (paymentId: string, adminEmail: string, reason: string) => void;

  /* admin */
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  upgradeToAdmin: (userId: string) => void;
}

/* =============================================================================
 * Helpers
 * ===========================================================================*/

const createId = () => Math.random().toString(36).slice(2, 11);
const nowIso = () => new Date().toISOString();

const startOfCurrentMonthIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

const isSameMonth = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

/* =============================================================================
 * Store
 * ===========================================================================*/

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      cvs: {},
      payments: [],
      exports: [],
      extraCredits: {},
      adminSettings: DEFAULT_ADMIN_SETTINGS,

      register: ({ email, password, fullName }) => {
        email = email.trim().toLowerCase();
        if (!email || !password || !fullName) {
          return { ok: false, error: 'Preenche todos os campos.' };
        }
        const existing = get().users.find((u) => u.email === email);
        if (existing) {
          return { ok: false, error: 'Email ja registado.' };
        }
        const isFirstUser = get().users.length === 0;
        const user: AppUser = {
          id: createId(),
          email,
          fullName,
          password,
          role: isFirstUser ? 'admin' : 'user',
          createdAt: nowIso(),
        };
        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.id,
        }));
        return { ok: true, user };
      },

      login: ({ email, password }) => {
        email = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email === email);
        if (!user || user.password !== password) {
          return { ok: false, error: 'Credenciais invalidas.' };
        }
        set({ currentUserId: user.id });
        return { ok: true, user };
      },

      logout: () => set({ currentUserId: null }),

      getUserCVs: (userId) => get().cvs[userId] || [],

      upsertCV: (userId, incoming) => {
        const list = get().cvs[userId] || [];
        const existing = incoming.id ? list.find((cv) => cv.id === incoming.id) : undefined;
        const now = nowIso();

        const next: SavedCV = existing
          ? { ...existing, ...incoming, id: existing.id, updatedAt: now }
          : {
              id: incoming.id || createId(),
              name: incoming.name,
              data: incoming.data,
              createdAt: now,
              updatedAt: now,
            };

        set((state) => ({
          cvs: {
            ...state.cvs,
            [userId]: existing
              ? list.map((cv) => (cv.id === next.id ? next : cv))
              : [...list, next],
          },
        }));

        return next;
      },

      deleteCV: (userId, cvId) =>
        set((state) => ({
          cvs: {
            ...state.cvs,
            [userId]: (state.cvs[userId] || []).filter((cv) => cv.id !== cvId),
          },
        })),

      getMonthlyExports: (userId) =>
        get().exports.filter((e) => e.userId === userId && isSameMonth(e.createdAt)).length,

      remainingFreeExports: (userId) => {
        const free = get().adminSettings.monthlyFreeExports;
        const used = get().getMonthlyExports(userId);
        return Math.max(0, free - used);
      },

      totalAvailableExports: (userId) => {
        return get().remainingFreeExports(userId) + (get().extraCredits[userId] || 0);
      },

      canExport: (userId) => get().totalAvailableExports(userId) > 0,

      recordExport: ({ userId, cvId, cvName }) => {
        const state = get();
        const freeLeft = state.remainingFreeExports(userId);
        const usedPaidCredit = freeLeft <= 0;

        const record: ExportRecord = {
          id: createId(),
          userId,
          cvId,
          cvName,
          createdAt: nowIso(),
          paid: usedPaidCredit,
        };

        set((curr) => ({
          exports: [...curr.exports, record],
          extraCredits: usedPaidCredit
            ? {
                ...curr.extraCredits,
                [userId]: Math.max(0, (curr.extraCredits[userId] || 0) - 1),
              }
            : curr.extraCredits,
        }));

        return record;
      },

      requestPayment: ({ userId, userEmail, mpesaReference, whatsappNumber, note }) => {
        const settings = get().adminSettings;
        const req: PaymentRequest = {
          id: createId(),
          userId,
          userEmail,
          amountMZN: settings.pricePerPackMZN,
          credits: settings.creditsPerPack,
          mpesaReference,
          whatsappNumber,
          note,
          status: 'pending',
          createdAt: nowIso(),
        };
        set((state) => ({ payments: [req, ...state.payments] }));
        return req;
      },

      approvePayment: (paymentId, adminEmail) => {
        set((state) => {
          const payment = state.payments.find((p) => p.id === paymentId);
          if (!payment || payment.status !== 'pending') return state;

          return {
            payments: state.payments.map((p) =>
              p.id === paymentId
                ? { ...p, status: 'approved', reviewedAt: nowIso(), reviewerEmail: adminEmail }
                : p
            ),
            extraCredits: {
              ...state.extraCredits,
              [payment.userId]: (state.extraCredits[payment.userId] || 0) + payment.credits,
            },
          };
        });
      },

      rejectPayment: (paymentId, adminEmail, reason) => {
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: 'rejected',
                  reviewedAt: nowIso(),
                  reviewerEmail: adminEmail,
                  rejectionReason: reason,
                }
              : p
          ),
        }));
      },

      updateAdminSettings: (settings) =>
        set((state) => ({ adminSettings: { ...state.adminSettings, ...settings } })),

      upgradeToAdmin: (userId) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u)),
        })),
    }),
    {
      name: 'cv-app-store',
    }
  )
);

/** Convenience selector to access current user or null. */
export const useCurrentUser = () => {
  const { users, currentUserId } = useAppStore();
  if (!currentUserId) return null;
  return users.find((u) => u.id === currentUserId) || null;
};

export { startOfCurrentMonthIso };

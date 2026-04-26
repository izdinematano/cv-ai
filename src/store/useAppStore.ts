'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CVData } from './useCVStore';
import { createIdbStorage } from '@/lib/idbStorage';
import {
  createDefaultTemplate,
  createTemplateFromBuiltIn,
  type CustomTemplateSpec,
} from '@/lib/customTemplate';

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

export interface CVVersion {
  id: string;
  createdAt: string;
  data: CVData;
}

export interface SavedCV {
  id: string;
  name: string;
  data: CVData;
  updatedAt: string;
  createdAt: string;
  /** Last N snapshots of this CV, newest first. Capped at MAX_VERSIONS. */
  versions?: CVVersion[];
}

/** Maximum number of historical snapshots kept per CV. */
export const MAX_VERSIONS = 5;

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
    Promise<{ ok: true; user: AppUser } | { ok: false; error: string }>;
  login: (input: { email: string; password: string }) =>
    Promise<{ ok: true; user: AppUser } | { ok: false; error: string }>;
  logout: () => void;

  /* cvs */
  getUserCVs: (userId: string) => SavedCV[];
  upsertCV: (
    userId: string,
    cv: { id?: string; name: string; data: CVData; snapshot?: boolean }
  ) => SavedCV;
  deleteCV: (userId: string, cvId: string) => void;
  restoreCVVersion: (userId: string, cvId: string, versionId: string) => SavedCV | null;

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
  }) => Promise<PaymentRequest>;
  approvePayment: (paymentId: string, adminEmail: string) => Promise<void>;
  rejectPayment: (paymentId: string, adminEmail: string, reason: string) => Promise<void>;

  /* admin */
  updateAdminSettings: (settings: Partial<AdminSettings>) => Promise<void>;
  upgradeToAdmin: (userId: string) => void;
  syncFromServer: () => Promise<void>;

  /* custom templates (built inside /admin) */
  customTemplates: CustomTemplateSpec[];
  createCustomTemplate: (name?: string) => CustomTemplateSpec;
  cloneBuiltInTemplate: (builtInId: string, builtInName: string, accentColor: string) => CustomTemplateSpec;
  updateCustomTemplate: (id: string, patch: Partial<CustomTemplateSpec>) => void;
  deleteCustomTemplate: (id: string) => void;
  duplicateCustomTemplate: (id: string) => CustomTemplateSpec | null;
  publishCustomTemplate: (id: string, published: boolean) => void;
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
      customTemplates: [],

      register: async ({ email, password, fullName }) => {
        email = email.trim().toLowerCase();
        if (!email || !password || !fullName) {
          return { ok: false, error: 'Preenche todos os campos.' };
        }
        try {
          const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName }),
          });
          const json = await res.json();
          if (!json.ok) return { ok: false, error: json.error || 'Erro ao registar.' };
          // Sync local copy so the list updates immediately.
          set((state) => ({
            users: [...state.users, json.user],
            currentUserId: json.user.id,
          }));
          return { ok: true, user: json.user };
        } catch {
          // Fallback to local-only if server is unreachable.
          const existing = get().users.find((u) => u.email === email);
          if (existing) {
            return { ok: false, error: 'Email ja registado.' };
          }
          const user: AppUser = {
            id: createId(),
            email,
            fullName,
            password,
            role: 'user',
            createdAt: nowIso(),
          };
          set((state) => ({
            users: [...state.users, user],
            currentUserId: user.id,
          }));
          return { ok: true, user };
        }
      },

      login: async ({ email, password }) => {
        email = email.trim().toLowerCase();
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!json.ok) return { ok: false, error: json.error || 'Credenciais invalidas.' };
          // Ensure the user exists locally (for offline fallback later).
          set((state) => {
            const idx = state.users.findIndex((u) => u.id === json.user.id);
            const updatedUsers = idx >= 0
              ? state.users.map((u, i) => (i === idx ? { ...u, ...json.user } : u))
              : [...state.users, json.user];
            return {
              users: updatedUsers,
              currentUserId: json.user.id,
            };
          });
          return { ok: true, user: json.user };
        } catch {
          const user = get().users.find((u) => u.email === email);
          if (!user || user.password !== password) {
            return { ok: false, error: 'Credenciais invalidas.' };
          }
          set({ currentUserId: user.id });
          return { ok: true, user };
        }
      },

      logout: () => set({ currentUserId: null }),

      getUserCVs: (userId) => get().cvs[userId] || [],

      upsertCV: (userId, incoming) => {
        const list = get().cvs[userId] || [];
        const existing = incoming.id ? list.find((cv) => cv.id === incoming.id) : undefined;
        const now = nowIso();

        // Build a trimmed version history. We only snapshot when the caller
        // asks for it (snapshot: true) AND the existing data actually differs
        // from the incoming one, so autosaves triggered by trivial re-renders
        // don't pollute the history.
        let versions: CVVersion[] | undefined = existing?.versions;
        if (existing && incoming.snapshot !== false) {
          const sameData =
            JSON.stringify(existing.data) === JSON.stringify(incoming.data);
          if (!sameData) {
            const snapshot: CVVersion = {
              id: createId(),
              createdAt: existing.updatedAt,
              data: existing.data,
            };
            versions = [snapshot, ...(existing.versions || [])].slice(0, MAX_VERSIONS);
          }
        }

        const next: SavedCV = existing
          ? {
              ...existing,
              name: incoming.name,
              data: incoming.data,
              id: existing.id,
              updatedAt: now,
              versions,
            }
          : {
              id: incoming.id || createId(),
              name: incoming.name,
              data: incoming.data,
              createdAt: now,
              updatedAt: now,
              versions: [],
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

      restoreCVVersion: (userId, cvId, versionId) => {
        const list = get().cvs[userId] || [];
        const target = list.find((cv) => cv.id === cvId);
        if (!target) return null;
        const version = (target.versions || []).find((v) => v.id === versionId);
        if (!version) return null;
        const now = nowIso();
        // Push the current state as the newest version before restoring, so
        // the restore itself is reversible.
        const currentSnapshot: CVVersion = {
          id: createId(),
          createdAt: target.updatedAt,
          data: target.data,
        };
        const remaining = (target.versions || []).filter((v) => v.id !== versionId);
        const nextVersions = [currentSnapshot, ...remaining].slice(0, MAX_VERSIONS);
        const next: SavedCV = {
          ...target,
          data: version.data,
          updatedAt: now,
          versions: nextVersions,
        };
        set((state) => ({
          cvs: {
            ...state.cvs,
            [userId]: list.map((cv) => (cv.id === cvId ? next : cv)),
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

      requestPayment: async ({ userId, userEmail, mpesaReference, whatsappNumber, note }) => {
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
        try {
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
          });
        } catch {
          // ignore — local copy is enough
        }
        set((state) => ({ payments: [req, ...state.payments] }));
        return req;
      },

      approvePayment: async (paymentId, adminEmail) => {
        try {
          await fetch('/api/payments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, status: 'approved', reviewerEmail: adminEmail }),
          });
        } catch {
          // ignore
        }
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

      rejectPayment: async (paymentId, adminEmail, reason) => {
        try {
          await fetch('/api/payments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, status: 'rejected', reviewerEmail: adminEmail, rejectionReason: reason }),
          });
        } catch {
          // ignore
        }
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

      updateAdminSettings: async (settings) => {
        try {
          await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
          });
        } catch {
          // ignore
        }
        set((state) => ({ adminSettings: { ...state.adminSettings, ...settings } }));
      },

      upgradeToAdmin: (userId) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u)),
        })),

      syncFromServer: async () => {
        try {
          const [usersRes, paymentsRes, settingsRes, exportsRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/payments'),
            fetch('/api/settings'),
            fetch('/api/exports'),
          ]);
          const [usersJson, paymentsJson, settingsJson, exportsJson] = await Promise.all([
            usersRes.json(),
            paymentsRes.json(),
            settingsRes.json(),
            exportsRes.json(),
          ]);
          set((state) => ({
            users: usersJson.users ?? state.users,
            payments: paymentsJson.payments ?? state.payments,
            adminSettings: settingsJson.settings ?? state.adminSettings,
            exports: exportsJson.exports ?? state.exports,
          }));
        } catch {
          // ignore — local data remains
        }
      },

      createCustomTemplate: (name) => {
        const spec = createDefaultTemplate(name || `Template ${new Date().toLocaleDateString('pt-PT')}`);
        set((state) => ({ customTemplates: [...state.customTemplates, spec] }));
        return spec;
      },

      cloneBuiltInTemplate: (builtInId, builtInName, accentColor) => {
        const spec = createTemplateFromBuiltIn(builtInId, builtInName, accentColor);
        set((state) => ({ customTemplates: [...state.customTemplates, spec] }));
        return spec;
      },

      updateCustomTemplate: (id, patch) =>
        set((state) => ({
          customTemplates: state.customTemplates.map((t) =>
            t.id === id ? { ...t, ...patch, id: t.id, updatedAt: nowIso() } : t
          ),
        })),

      deleteCustomTemplate: (id) =>
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
        })),

      duplicateCustomTemplate: (id) => {
        const existing = get().customTemplates.find((t) => t.id === id);
        if (!existing) return null;
        const now = nowIso();
        const copy: CustomTemplateSpec = {
          ...existing,
          id: `custom-${createId()}`,
          name: `${existing.name} (cópia)`,
          published: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ customTemplates: [...state.customTemplates, copy] }));
        return copy;
      },

      publishCustomTemplate: (id, published) =>
        set((state) => ({
          customTemplates: state.customTemplates.map((t) =>
            t.id === id ? { ...t, published, updatedAt: nowIso() } : t
          ),
        })),
    }),
    {
      name: 'cv-app-store',
      // Store accounts/saved CVs/export history in IndexedDB rather than
      // localStorage, so the ~5MB-per-origin quota is not the bottleneck as
      // soon as a user saves a CV with a photo. See @/lib/idbStorage.
      storage: createJSONStorage(() => createIdbStorage()),
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

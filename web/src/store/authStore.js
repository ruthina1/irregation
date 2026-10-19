import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      updateUser: (user) =>
        set({ user }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'iaims-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define Session Store with Persistence (LocalStorage)
export const useSession = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Action: Login Success
            setSession: (user, token) => {
                set({ user, token, isAuthenticated: true });
            },

            // Action: Logout or Session Expired
            clearSession: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token'); // Hard clean for safety
            },
        }),
        {
            name: 'credia-session-storage', // Key in LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);